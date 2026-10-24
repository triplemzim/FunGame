import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../src/audio.js';

function parameter() {
  const events = [];
  return {
    events,
    setValueAtTime(value, time) { events.push(['set', value, time]); },
    linearRampToValueAtTime(value, time) { events.push(['linear', value, time]); },
    exponentialRampToValueAtTime(value, time) { events.push(['exponential', value, time]); },
    cancelScheduledValues(time) { events.push(['cancel', time]); },
  };
}

function contextStub({ state = 'suspended', rejectResume = false, remainSuspended = false } = {}) {
  const context = {
    state, currentTime: 0, destination: {}, resumeCalls: 0, oscillators: [], gains: [], connected: new Set(),
    async resume() {
      this.resumeCalls++;
      if (rejectResume) throw new Error('Gesture rejected');
      if (!remainSuspended) this.state = 'running';
    },
    createOscillator() {
      const oscillator = {
        frequency: parameter(), starts: [], stops: [], disconnected: false,
        connect() { context.connected.add(this); },
        disconnect() { this.disconnected = true; context.connected.delete(this); },
        start(time) { this.starts.push(time); },
        stop(time) { this.stops.push(time); },
        onended: null,
      };
      this.oscillators.push(oscillator);
      return oscillator;
    },
    createGain() {
      const gain = { gain: parameter(), connectedTo: null, disconnected: false,
        connect(target) { this.connectedTo = target; },
        disconnect() { this.disconnected = true; },
      };
      this.gains.push(gain);
      return gain;
    },
  };
  return context;
}

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { values, getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}

test('audio remains lazy and silent until a successful gesture unlock', async () => {
  const context = contextStub();
  let creations = 0;
  const audio = createAudio({ contextFactory: () => { creations++; return context; }, storage: null });
  assert.equal(audio.state, 'locked');
  assert.equal(audio.play('catch'), false);
  audio.stop();
  assert.equal(creations, 0);
  assert.equal(await audio.unlock(), true);
  assert.equal(creations, 1);
  assert.equal(context.resumeCalls, 1);
  assert.equal(audio.state, 'running');
  assert.equal(audio.play('catch'), true);
  assert.equal(context.oscillators.length, 2);
  for (const [index, oscillator] of context.oscillators.entries()) {
    assert.equal(oscillator.type, 'triangle');
    assert.equal(oscillator.starts.length, 1);
    assert.ok(oscillator.stops[0] > oscillator.starts[0]);
    assert.ok(oscillator.stops[0] < .4);
    const envelope = context.gains[index].gain.events;
    assert.equal(envelope[0][1], 0);
    assert.ok(envelope[1][1] > 0 && envelope[1][1] < .1);
    assert.equal(envelope.at(-1)[1], 0);
    assert.equal(context.gains[index].connectedTo, context.destination);
  }
});

test('mute preference persists and muting stops all current and future notes immediately', async () => {
  const storage = memoryStorage({ 'career-catcher:muted': 'true' });
  const context = contextStub();
  let creations = 0;
  const audio = createAudio({ storage, contextFactory: () => { creations++; return context; } });
  assert.equal(audio.muted, true);
  assert.equal(audio.state, 'muted');
  assert.equal(await audio.unlock(), false);
  assert.equal(creations, 0);
  assert.equal(await audio.setMuted(false), true);
  assert.equal(storage.values.get('career-catcher:muted'), 'false');
  assert.equal(audio.play('ending', 'victory'), true);
  context.currentTime = .02;
  await audio.setMuted(true);
  assert.equal(audio.muted, true);
  assert.equal(audio.state, 'muted');
  assert.equal(storage.values.get('career-catcher:muted'), 'true');
  assert.equal(context.connected.size, 0);
  for (const oscillator of context.oscillators) {
    assert.equal(oscillator.stops.at(-1), .02);
    assert.equal(oscillator.disconnected, true);
  }
  assert.equal(audio.play('hit'), false);
});

test('stop cancels cues without changing the mute preference and permits a fresh run', async () => {
  const context = contextStub({ state: 'running' });
  const storage = memoryStorage();
  const audio = createAudio({ contextFactory: () => context, storage });
  await audio.unlock();
  audio.play('catch');
  audio.stop();
  assert.equal(audio.muted, false);
  assert.equal(audio.state, 'running');
  assert.equal(storage.values.size, 0);
  assert.equal(context.connected.size, 0);
  assert.equal(audio.play('catch'), true);
});

test('unavailable contexts, denied resume, and a still-suspended context fail harmlessly', async () => {
  for (const factory of [() => null, () => { throw new Error('Audio unavailable'); }]) {
    const audio = createAudio({ contextFactory: factory, storage: null });
    assert.equal(await audio.unlock(), false);
    assert.equal(audio.state, 'unavailable');
    assert.equal(audio.play('catch'), false);
    assert.doesNotThrow(() => audio.stop());
  }
  const denied = createAudio({ contextFactory: () => contextStub({ rejectResume: true }), storage: null });
  assert.equal(await denied.unlock(), false);
  assert.equal(denied.state, 'suspended');
  assert.equal(denied.play('catch'), false);
  const suspended = createAudio({ contextFactory: () => contextStub({ remainSuspended: true }), storage: null });
  assert.equal(await suspended.unlock(), false);
  assert.equal(suspended.state, 'suspended');
  assert.equal(suspended.play('catch'), false);
});

test('blocked storage getter and storage operations never prevent audio or game actions', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('Blocked storage'); } });
  try {
    const audio = createAudio({ contextFactory: () => contextStub({ state: 'running' }) });
    assert.equal(await audio.unlock(), true);
    await audio.setMuted(true);
    assert.equal(audio.muted, true);
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
  const audio = createAudio({
    storage: { getItem() { return 'false'; }, setItem() { throw new Error('Quota'); } },
    contextFactory: () => contextStub({ state: 'running' }),
  });
  assert.equal(await audio.unlock(), true);
  await audio.setMuted(true);
  assert.equal(audio.muted, true);
});

test('major events replace routine cues while bursts and lower-priority overlap are suppressed', async () => {
  const context = contextStub({ state: 'running' });
  const audio = createAudio({ contextFactory: () => context, storage: null });
  await audio.unlock();
  assert.equal(audio.play('catch'), true);
  assert.equal(audio.play('catch'), false);
  context.currentTime = .01;
  assert.equal(audio.play('coffee'), true);
  assert.ok(context.oscillators.slice(0, 2).every(note => note.disconnected));
  assert.equal(audio.play('catch'), false);
  context.currentTime = .02;
  assert.equal(audio.play('hit'), true);
  context.currentTime = .03;
  assert.equal(audio.play('promotion'), true);
  assert.equal(audio.play('hit'), false);
  context.currentTime = .04;
  assert.equal(audio.play('ending', 'victory'), true);
  assert.equal(audio.play('promotion'), false);
  assert.equal(context.connected.size, 4);
});

test('event and ending variants schedule distinct short cues', async () => {
  const signatures = new Map();
  for (const [type, outcome] of [['catch'], ['coffee'], ['hit'], ['promotion'], ['demotion'], ['denied'], ['ending', 'victory'], ['ending', 'dismissed'], ['ending', 'contractReview']]) {
    const context = contextStub({ state: 'running' });
    const audio = createAudio({ contextFactory: () => context, storage: null });
    await audio.unlock();
    assert.equal(audio.play(type, outcome), true);
    assert.ok(context.oscillators.length > 0 && context.oscillators.length <= 4);
    assert.ok(context.oscillators.every(note => note.stops[0] <= .4));
    const signature = context.oscillators.map(note => note.frequency.events[0][1]).join(',');
    signatures.set(`${type}:${outcome || ''}`, signature);
  }
  assert.equal(new Set(signatures.values()).size, signatures.size);
});

test('normal ending callbacks and successive cues keep the connected voice count bounded', async () => {
  const context = contextStub({ state: 'running' });
  const audio = createAudio({ contextFactory: () => context, storage: null });
  await audio.unlock();
  for (let i = 0; i < 20; i++) {
    context.currentTime = i;
    assert.equal(audio.play('catch'), true);
    assert.ok(context.connected.size <= 2);
  }
  const latest = context.oscillators.slice(-2);
  for (const note of latest) note.onended();
  assert.equal(context.connected.size, 0);
  const stops = latest.map(note => note.stops.length);
  audio.stop();
  assert.deepEqual(latest.map(note => note.stops.length), stops);
  assert.equal(audio.play('unknown'), false);
});

test('node creation failures and unexpected event arguments fail without throwing', async () => {
  const context = contextStub({ state: 'running' });
  const audio = createAudio({ contextFactory: () => context, storage: null });
  await audio.unlock();
  assert.equal(audio.play('__proto__'), false);
  assert.equal(audio.play('ending', Symbol('invalid')), false);
  context.createGain = () => { throw new Error('Device unavailable'); };
  assert.doesNotThrow(() => assert.equal(audio.play('hit'), false));
  assert.doesNotThrow(() => audio.stop());
  Object.defineProperty(context, 'currentTime', { get() { throw new Error('Closed device'); } });
  assert.doesNotThrow(() => assert.equal(audio.play('catch'), false));
  assert.doesNotThrow(() => audio.stop());
});
