import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { INTERVIEWS } from '../src/interviews.js';

if (!vm.SourceTextModule) {
  throw new Error('Run with: node --experimental-vm-modules --test scripts/test-controls.mjs');
}

const [mainSource, movementSource, html, simulationSource, rulesSource, collisionSource, fairnessSource, audioSource, interviewsSource] = await Promise.all([
  readFile(new URL('../src/main.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/movement.js', import.meta.url), 'utf8'),
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../src/simulation.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/rules.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/collision.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/fairness.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/audio.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/interviews.js', import.meta.url), 'utf8'),
]);

// Only the event, focus, and capture methods consumed by main.js are modeled.
// These tests exercise its real routing code, not a browser's event synthesis.
class Target {
  listeners = new Map();
  dataset = {};
  captures = new Set();

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  emit(type, values = {}) {
    const event = {
      type, target: this, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      ...values,
    };
    for (const listener of this.listeners.get(type) ?? []) listener.call(this, event);
    return event;
  }

  setAttribute(name, value) { this[name] = value; }
  setPointerCapture(id) { this.captures.add(id); }
  hasPointerCapture(id) { return this.captures.has(id); }
  releasePointerCapture(id) {
    if (this.captures.delete(id)) this.emit('lostpointercapture', { pointerId: id });
  }
}

async function playground({ initialState = null } = {}) {
  const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(([, id]) => [id, new Target()]));
  const buttonIds = [...html.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map(([, id]) => id);
  const document = new Target();
  const window = new Target();
  const frames = [];
  const renders = [];
  let time = 0;
  document.body = new Target();
  document.activeElement = document.body;
  document.hidden = false;
  document.getElementById = id => elements.get(id) ?? null;
  document.querySelectorAll = selector => {
    assert.equal(selector, 'button');
    return buttonIds.map(id => elements.get(id));
  };
  for (const element of elements.values()) {
    element.focus = () => { document.activeElement = element; };
  }
  elements.get('game-card').contains = element => element !== elements.get('sound-button') && [...elements.values()].includes(element);

  const context = vm.createContext({
    document, window, queueMicrotask,
    requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
  });
  const movement = new vm.SourceTextModule(movementSource, { context, identifier: 'movement.js' });
  const audio = new vm.SourceTextModule(audioSource, { context, identifier: 'audio.js' });
  const interviews = new vm.SourceTextModule(interviewsSource, { context, identifier: 'interviews.js' });
  const collision = new vm.SourceTextModule(collisionSource, { context, identifier: 'collision.js' });
  const fairness = new vm.SourceTextModule(fairnessSource, { context, identifier: 'fairness.js' });
  const rules = new vm.SourceTextModule(rulesSource, { context, identifier: 'rules.js' });
  const simulation = new vm.SourceTextModule(simulationSource, { context, identifier: 'simulation.js' });
  const renderer = new vm.SyntheticModule(['createOfficeShell'], function () {
    this.setExport('createOfficeShell', () => ({ render(model) { renders.push({ ...model }); } }));
  }, { context, identifier: 'game.js' });
  const configuredSource = initialState ? mainSource.replace('const simulation = createSimulation();', `const simulation = createSimulation(${JSON.stringify({ seed: 1, spawnEnabled: false, initialState })});`) : mainSource;
  const main = new vm.SourceTextModule(configuredSource, { context, identifier: 'main.js' });
  const link = specifier => {
    if (specifier === './movement.js') return movement;
    if (specifier === './game.js') return renderer;
    if (specifier === './simulation.js') return simulation;
    if (specifier === './rules.js') return rules;
    if (specifier === './collision.js') return collision;
    if (specifier === './fairness.js') return fairness;
    if (specifier === './audio.js') return audio;
    if (specifier === './interviews.js') return interviews;
    throw new Error(`Unexpected main.js dependency: ${specifier}`);
  };
  await main.link(link);
  await main.evaluate();

  function tick(count = 1) {
    for (let frame = 0; frame < count; frame++) {
      assert.equal(frames.length, 1, 'exactly one animation callback must be queued');
      const callback = frames.shift();
      time += 1000 / 60;
      callback(time);
      assert.equal(frames.length, 1, 'one callback must remain after each frame');
    }
  }

  function click(id, values = {}) {
    return elements.get(id).emit('click', { detail: 0, ...values });
  }

  function key(type, code, values = {}) {
    const event = { target: document.activeElement, code, key: code, repeat: false, ...values };
    document.activeElement.emit(type, event);
    return window.emit(type, event);
  }

  function pointer(type, id, pointerId = 7, values = {}) {
    const button = elements.get(id);
    if (type === 'lostpointercapture') button.captures.delete(pointerId);
    const event = { pointerId, pointerType: 'touch', button: 0, ...values };
    button.emit(type, event);
    if (type === 'pointerdown') document.emit(type, { ...event, target: button });
  }

  return {
    elements, document, window, frames, tick, click, key, pointer,
    state: () => { const { lane, x, moving, direction, phase } = renders.at(-1); return { lane, x, moving, direction, phase }; },
    model: () => renders.at(-1),
    start: () => click('start-button'),
  };
}

test('pointer down/up moves one lane without a synthesized-click double step', async () => {
  const app = await playground();
  app.start();
  app.pointer('pointerdown', 'move-right');
  assert.equal(app.state().lane, 3);
  assert.equal(app.elements.get('move-right').dataset.pressed, 'true');
  app.pointer('pointerup', 'move-right');
  app.click('move-right', { detail: 0, pointerType: 'touch' });
  app.click('move-right', { detail: 1, pointerType: 'mouse' });
  app.tick(60);
  assert.deepEqual(app.state(), { lane: 3, x: 432, moving: false, direction: 0, phase: 'playing' });
  assert.equal(app.elements.get('move-right').dataset.pressed, 'false');
});

for (const cancellation of ['pointercancel', 'lostpointercapture']) {
  test(`${cancellation} clears its held source and prevents later repeat`, async () => {
    const app = await playground();
    app.start();
    app.pointer('pointerdown', 'move-right');
    app.tick(4);
    app.pointer(cancellation, 'move-right');
    assert.equal(app.elements.get('move-right').dataset.pressed, 'false');
    assert.equal(app.elements.get('move-right').captures.size, 0);
    app.tick(60);
    assert.equal(app.state().lane, 3);
    assert.equal(app.state().x, 432);
    app.pointer('pointerdown', 'move-left', 8);
    app.pointer('pointerup', 'move-left', 8);
    app.tick(10);
    assert.equal(app.state().x, 320, 'a fresh pointer still works after cancellation');
  });
}

for (const input of ['keyboard', 'pointer']) {
  test(`window blur while ${input} is held freezes and requires a clean explicit resume`, async () => {
    const app = await playground();
    app.start();
    if (input === 'keyboard') app.key('keydown', 'ArrowRight');
    else app.pointer('pointerdown', 'move-right');
    app.tick(4);
    const xBeforePause = app.state().x;
    app.window.emit('blur');
    assert.equal(app.state().phase, 'paused');
    assert.equal(app.elements.get('move-right').disabled, true);
    assert.equal(app.elements.get('move-right').dataset.pressed, 'false');
    assert.equal(app.elements.get('move-right').captures.size, 0);
    app.tick(60);
    assert.equal(app.state().x, xBeforePause);
    assert.equal(app.state().phase, 'paused');
    app.click('resume-button');
    app.key('keydown', 'ArrowRight', { repeat: true });
    app.tick(60);
    assert.equal(app.state().phase, 'playing');
    assert.equal(app.state().lane, 3, 'resume must not restore the old held direction');
    assert.equal(app.state().x, 432, 'only the already-started transition may finish');
  });
}

test('leaving game focus and hiding the document both pause active input', async () => {
  const app = await playground();
  app.start();
  app.key('keydown', 'KeyA');
  app.tick(3);
  app.document.activeElement = app.document.body;
  app.elements.get('game-card').emit('focusout', { relatedTarget: null });
  await Promise.resolve();
  assert.equal(app.state().phase, 'paused');
  const pausedX = app.state().x;
  app.tick(30);
  assert.equal(app.state().x, pausedX);
  app.click('resume-button');
  app.key('keydown', 'KeyD');
  app.document.hidden = true;
  app.document.emit('visibilitychange');
  assert.equal(app.state().phase, 'paused');
  app.tick(30);
  assert.equal(app.state().x, pausedX);
});

test('reset clears active sources and preserves one animation loop across five restarts', async () => {
  const app = await playground();
  for (let retry = 0; retry < 5; retry++) {
    app.start();
    app.key('keydown', 'KeyA');
    app.pointer('pointerdown', 'move-right', retry + 10);
    app.tick(4);
    app.click('reset-button');
    assert.deepEqual(app.state(), { lane: 2, x: 320, moving: false, direction: 0, phase: 'ready' });
    assert.equal(app.elements.get('move-right').captures.size, 0);
    app.tick(20);
    app.key('keyup', 'KeyA');
    assert.equal(app.state().lane, 2);
    assert.equal(app.frames.length, 1);
  }
  app.start();
  app.tick(60);
  assert.equal(app.state().x, 320, 'a fresh run cannot inherit old held sources');
});

test('keyboard and pointer holds use equivalent movement and repeat timing', async () => {
  const keyboard = await playground();
  const pointer = await playground();
  keyboard.start();
  pointer.start();
  keyboard.key('keydown', 'ArrowRight');
  pointer.pointer('pointerdown', 'move-right');
  for (let frame = 0; frame < 30; frame++) {
    keyboard.tick();
    pointer.tick();
    assert.deepEqual(keyboard.state(), pointer.state());
  }
});


for (const [outcome, initialState, title] of [
  ['dismissed', { reputation: 30, items: [{ type: 'bug', x: 320, y: 330, vy: 0 }] }, 'Production access revoked.'],
  ['victory', { rankIndex: 6, promotionProgress: 519, items: [{ type: 'build', x: 320, y: 330, vy: 0 }] }, 'You made CEO.'],
  ['contractReview', { elapsedMs: 179999 }, 'Contract reviewed.'],
]) {
  test(`${outcome} presents accurate results, stops time, and offers a fresh retry`, async () => {
    const app = await playground({ initialState });
    app.start();
    app.tick(2);
    if (outcome === 'victory') {
      const question = INTERVIEWS.find(question => question.id === app.model().interview.id);
      app.click(question.answer ? 'interview-yes' : 'interview-no');
      app.click('interview-continue');
    }
    assert.equal(app.state().phase, outcome);
    assert.equal(app.elements.get('result-title').textContent, title);
    assert.equal(app.elements.get('results-overlay').hidden, false);
    assert.equal(app.elements.get('movement-controls').hidden, true);
    assert.equal(app.document.activeElement, app.elements.get('retry-button'));
    const time = app.elements.get('hud-time').textContent;
    const score = app.elements.get('hud-score').textContent;
    app.tick(120);
    assert.equal(app.elements.get('hud-time').textContent, time);
    assert.equal(app.elements.get('hud-score').textContent, score);
    app.click('retry-button');
    assert.equal(app.state().phase, 'playing');
    assert.equal(app.elements.get('results-overlay').hidden, true);
    assert.equal(app.document.activeElement, app.elements.get('office-canvas'));
  });
}

const interviewInitial = (rankIndex = 0, target = 150) => ({ rankIndex, promotionProgress: target - 30, items: [{ type: 'build', x: 320, y: 330, vy: 0 }] });

test('interview freezes the office, shows a denial once, and resumes without losing lifetime score or rank', async () => {
  const app = await playground({ initialState: interviewInitial() });
  app.start();
  app.tick();
  assert.equal(app.state().phase, 'interview');
  assert.equal(app.elements.get('interview-overlay').hidden, false);
  assert.equal(app.elements.get('interview-choices').hidden, false);
  assert.equal(app.document.activeElement, app.elements.get('interview-overlay'));
  const frozen = app.model();
  app.key('keydown', 'ArrowRight');
  app.tick(120);
  app.key('keyup', 'ArrowRight');
  assert.equal(app.model().elapsedMs, frozen.elapsedMs);
  assert.equal(app.model().x, frozen.x);
  const question = INTERVIEWS.find(question => question.id === app.model().interview.id);
  assert.equal(app.elements.get('interview-question').textContent, question.prompt);
  app.click(question.answer ? 'interview-no' : 'interview-yes');
  assert.equal(app.state().phase, 'interview');
  assert.equal(app.elements.get('interview-result').textContent, 'Promotion denied.');
  assert.equal(app.elements.get('interview-feedback').textContent, question.incorrectFeedback);
  assert.equal(app.elements.get('interview-choices').hidden, true);
  assert.equal(app.document.activeElement, app.elements.get('interview-continue'));
  app.click(question.answer ? 'interview-yes' : 'interview-no');
  assert.equal(app.model().interview.correct, false, 'a second activation cannot change the answer');
  app.tick(120);
  assert.equal(app.model().elapsedMs, frozen.elapsedMs);
  app.click('interview-continue');
  assert.equal(app.state().phase, 'playing');
  assert.equal(app.model().promotionProgress, 120);
  assert.equal(app.model().careerPoints, 30);
  assert.equal(app.model().rankIndex, 0);
  assert.equal(app.model().reputation, 100);
  assert.equal(app.elements.get('interview-overlay').hidden, true);
  assert.equal(app.document.activeElement, app.elements.get('office-canvas'));
});

test('correct answer requires explicit Continue before granting a promotion', async () => {
  const app = await playground({ initialState: interviewInitial() });
  app.start();
  app.tick();
  const question = INTERVIEWS.find(question => question.id === app.model().interview.id);
  app.click('interview-continue');
  assert.equal(app.state().phase, 'interview', 'Continue cannot bypass an unanswered question');
  app.click(question.answer ? 'interview-yes' : 'interview-no');
  assert.equal(app.elements.get('interview-result').textContent, 'Promotion approved.');
  assert.equal(app.elements.get('hud-rank').textContent, 'Intern');
  const frozenTime = app.model().elapsedMs;
  app.tick(90);
  assert.equal(app.model().elapsedMs, frozenTime);
  app.click('interview-continue');
  assert.equal(app.state().phase, 'promotion');
  assert.equal(app.model().rankIndex, 1);
  app.tick(45);
  assert.equal(app.state().phase, 'playing');
  assert.equal(app.model().x, 320, 'answering cannot leave held movement behind');
});

test('interview keyboard focus cycles through available answers and result Continue', async () => {
  const app = await playground({ initialState: interviewInitial() });
  app.start();
  app.tick();
  app.key('keydown', 'Tab');
  assert.equal(app.document.activeElement, app.elements.get('interview-yes'));
  app.key('keydown', 'Tab', { shiftKey: true });
  assert.equal(app.document.activeElement, app.elements.get('interview-no'));
  app.key('keydown', 'Tab');
  assert.equal(app.document.activeElement, app.elements.get('interview-yes'));
  app.click('interview-no');
  app.key('keydown', 'Tab');
  assert.equal(app.document.activeElement, app.elements.get('interview-continue'));
  app.key('keydown', 'Tab', { shiftKey: true });
  assert.equal(app.document.activeElement, app.elements.get('interview-continue'));
});

test('focus loss keeps an interview frozen and reset removes its pending question', async () => {
  const app = await playground({ initialState: interviewInitial() });
  app.start();
  app.tick();
  const questionId = app.model().interview.id;
  const time = app.model().elapsedMs;
  app.window.emit('blur');
  app.document.hidden = true;
  app.document.emit('visibilitychange');
  app.tick(120);
  assert.equal(app.state().phase, 'interview');
  assert.equal(app.model().interview.id, questionId);
  assert.equal(app.model().elapsedMs, time);
  app.document.hidden = false;
  app.click('reset-button');
  assert.equal(app.state().phase, 'ready');
  assert.equal(app.model().interview, null);
  assert.equal(app.elements.get('interview-overlay').hidden, true);
});

test('a double tap on final interview Continue cannot activate the newly revealed Retry', async () => {
  const app = await playground({ initialState: interviewInitial(6, 520) });
  app.start();
  app.tick();
  const question = INTERVIEWS.find(question => question.id === app.model().interview.id);
  app.click(question.answer ? 'interview-yes' : 'interview-no');
  app.click('interview-continue', { detail: 1, timeStamp: 1000 });
  assert.equal(app.state().phase, 'victory');
  app.click('retry-button', { detail: 2, timeStamp: 1100 });
  assert.equal(app.state().phase, 'victory');
  app.click('retry-button', { detail: 1, timeStamp: 1500 });
  assert.equal(app.state().phase, 'playing', 'a fresh retry remains available');
});
