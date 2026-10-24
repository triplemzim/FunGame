import { createOfficeShell } from './game.js';
import { LANE_COUNT } from './movement.js';
import { createSimulation } from './simulation.js';
import { RANKS } from './rules.js';

const find = (id) => document.getElementById(id);
const setText = (id, value) => { const element = find(id); if (element.textContent !== String(value)) element.textContent = String(value); };
const gameCard = find('game-card');
const canvas = find('office-canvas');
const startButton = find('start-button');
const resetButton = find('reset-button');
const pauseButton = find('pause-button');
const resumeButton = find('resume-button');
const retryButton = find('retry-button');
const leftButton = find('move-left');
const rightButton = find('move-right');
const simulation = createSimulation();
const shell = createOfficeShell(canvas);
const keys = new Map();
const pointers = new Map();
const keyDirections = new Map([['ArrowLeft', -1], ['KeyA', -1], ['ArrowRight', 1], ['KeyD', 1]]);
const terminalPhases = new Set(['victory', 'dismissed', 'contractReview']);
const timedPhases = new Set(['playing', 'promotion', 'demotion']);
const STEP_MS = 1000 / 60;
let lastFrame = null;
let accumulator = 0;
let announcedLane = -1;
let presentedPhase = null;
let pauseReason = 'manual';
let feedback = { text: '', until: 0, priority: 0 };

function rankName(index) { return RANKS[index]?.shortName || RANKS[index]?.name || 'Intern'; }
function formatTime(ms) { const seconds = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function resetTiming() { lastFrame = null; accumulator = 0; }

function clearControls() {
  simulation.clearInput();
  keys.clear();
  const captured = [...pointers.entries()];
  pointers.clear();
  for (const [id, { button }] of captured) if (button.hasPointerCapture(id)) button.releasePointerCapture(id);
}

function present({ focus } = {}) {
  const model = simulation.snapshot();
  const phase = model.phase;
  const active = phase !== 'ready';
  const terminal = terminalPhases.has(phase);
  if (phase !== presentedPhase) {
    presentedPhase = phase;
    clearControls();
    document.body.dataset.state = phase;
    startButton.hidden = active;
    find('session-actions').hidden = !active || terminal;
    pauseButton.hidden = !timedPhases.has(phase);
    find('movement-controls').hidden = !active || terminal;
    find('game-hud').hidden = !active;
    find('pause-overlay').hidden = phase !== 'paused';
    find('results-overlay').hidden = !terminal;
    find('transition-banner').hidden = !['promotion', 'demotion'].includes(phase);
    leftButton.disabled = rightButton.disabled = phase !== 'playing';
    setText('state-title', phase === 'paused' ? 'A well-earned breather.' : terminal ? 'Your next chapter awaits.' : active ? 'Ship it. Keep moving.' : 'Ready for your first day?');
    setText('state-description', active ? 'Catch green builds. Dodge production bugs. Coffee restores team trust.' : 'Degree acquired. Production access pending.');
    setText('scene-caption', active ? '' : 'New degree. First desk. Big ambitions.');
    setText('action-note', active ? 'Missed items are harmless. Every catch counts.' : 'Arrow keys or A / D. Your first move starts here.');
    setText('pause-reason', pauseReason === 'focus' ? 'You stepped away. Your contract clock is paused.' : "Your lane is saved. Resume when you're ready.");
    canvas.setAttribute('aria-label', active ? 'Career Catcher office. Catch green checkmarks and coffee with your laptop; avoid coral bugs. Move with arrow keys, A or D, or the direction buttons.' : 'A new CS graduate at their first desk in a tech office.');
    if (terminal) setText('movement-status', 'Run complete. Results ready. Choose Try Another Career.');
    else if (phase === 'promotion' || phase === 'demotion') setText('movement-status', `${phase === 'promotion' ? 'Promoted' : 'Demoted'} to ${rankName(model.rankIndex)}.`);
    else if (phase === 'paused') setText('movement-status', 'Paused. Choose Resume Work to continue.');
    else { announcedLane = -1; setText('movement-status', active ? 'Move with the left and right controls.' : ''); }
    if (terminal) focus = retryButton;
  }
  for (const event of simulation.drainEvents()) {
    const priority = ['ending', 'promotion', 'demotion'].includes(event.type) ? 3 : event.type === 'hit' ? 2 : 1;
    if (priority >= feedback.priority || model.elapsedMs >= feedback.until) {
      const defaults = { catch: `+${event.points || 30} points. All checks passed.`, coffee: '+12 team trust. Critical infrastructure restored.', hit: 'Production incident. −30 team trust.', promotion: `Promoted to ${rankName(model.rankIndex)}.`, demotion: 'Access downgraded. A fresh climb starts here.' };
      feedback = { text: event.message || event.text || defaults[event.type] || '', until: model.elapsedMs + 1700, priority };
    }
  }
  if (model.elapsedMs >= feedback.until && phase === 'playing') feedback = { text: '', until: 0, priority: 0 };
  setText('event-message', feedback.text || (phase === 'playing' ? 'Catch wins. Dodge bugs. Keep your team’s trust.' : ''));
  find('event-message').dataset.kind = feedback.priority > 1 ? 'important' : 'routine';
  shell.render(model);
  canvas.dataset.lane = String(model.lane + 1);
  canvas.dataset.playerX = model.x.toFixed(2);
  canvas.dataset.items = String(model.items?.length || 0);
  setText('lane-status', `Lane ${model.lane + 1} / ${LANE_COUNT}`);
  setText('rank-label', rankName(model.rankIndex));
  setText('hud-rank', rankName(model.rankIndex));
  setText('hud-trust', model.reputation);
  setText('hud-time', formatTime(model.remainingMs));
  setText('hud-score', model.careerPoints);
  find('trust-bar').value = model.reputation;
  document.body.dataset.lowTrust = String(model.reputation < 40);
  find('promotion-bar').max = model.promotionTarget || 1;
  find('promotion-bar').value = model.promotionTarget ? Math.min(model.promotionProgress, model.promotionTarget) : 1;
  setText('promotion-label', terminal ? (phase === 'victory' ? 'CEO reached' : 'Run complete') : !model.promotionTarget ? 'CEO reached' : model.reputation < 40 && model.promotionProgress >= model.promotionTarget ? 'Promotion pending — restore team trust to 40' : `Next promotion: ${model.promotionProgress} / ${model.promotionTarget}`);
  if (phase === 'promotion' || phase === 'demotion') {
    setText('transition-title', `${phase === 'promotion' ? 'Promoted' : 'Reassigned'}: ${rankName(model.rankIndex)}`);
    setText('transition-message', typeof model.notice === 'string' ? model.notice : RANKS[model.rankIndex]?.joke || 'Your next chapter starts here.');
  }
  if (terminal) {
    const endings = {
      victory: ['You made CEO.', 'You automated the stand-up. Then scheduled a meeting about it.'],
      dismissed: ['Production access revoked.', 'A short internship. An impressively long incident report.'],
      contractReview: ['Contract reviewed.', 'Three minutes on the clock. A career worth another run.'],
    };
    setText('result-title', endings[phase][0]);
    setText('result-message', endings[phase][1]);
    setText('result-highest', rankName(model.highestRank));
    setText('result-rank', rankName(model.rankIndex));
    setText('result-score', model.careerPoints);
    setText('result-time', `${(model.elapsedMs / 1000).toFixed(1)}s`);
    setText('result-incidents', model.stats.incidents);
    setText('result-demotions', model.stats.demotions);
  }
  const held = [...keys.values(), ...[...pointers.values()].map((pointer) => pointer.direction)];
  leftButton.dataset.pressed = String(phase === 'playing' && held.includes(-1));
  rightButton.dataset.pressed = String(phase === 'playing' && held.includes(1));
  if (phase === 'playing' && !model.moving && model.lane !== announcedLane) {
    announcedLane = model.lane;
    setText('movement-status', `Lane ${model.lane + 1} of ${LANE_COUNT}.`);
  }
  if (focus) focus.focus({ preventScroll: true });
}

function startRun() {
  clearControls();
  feedback = { text: '', until: 0, priority: 0 };
  simulation.start();
  resetTiming();
  present({ focus: canvas });
}
function pause(reason = 'manual') {
  if (!timedPhases.has(simulation.phase)) return;
  pauseReason = reason;
  simulation.pause();
  resetTiming();
  present({ focus: reason === 'manual' ? resumeButton : undefined });
}
startButton.addEventListener('click', () => { if (simulation.phase === 'ready') startRun(); });
retryButton.addEventListener('click', () => { if (terminalPhases.has(simulation.phase)) startRun(); });
resetButton.addEventListener('click', () => {
  clearControls();
  simulation.reset();
  feedback = { text: '', until: 0, priority: 0 };
  resetTiming();
  present({ focus: startButton });
});
pauseButton.addEventListener('click', () => pause());
resumeButton.addEventListener('click', () => {
  if (simulation.phase !== 'paused') return;
  simulation.resume();
  resetTiming();
  present({ focus: canvas });
});

function ownsFocus() {
  return gameCard.contains(document.activeElement);
}

window.addEventListener('keydown', (event) => {
  if (!ownsFocus() || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.target === canvas && ['Enter', 'Space'].includes(event.code)
      && (simulation.phase === 'ready' || terminalPhases.has(simulation.phase))) {
    event.preventDefault();
    if (!event.repeat) startRun();
    return;
  }
  if (event.code === 'Escape' && simulation.phase === 'playing') {
    event.preventDefault();
    if (!event.repeat) pause();
    return;
  }
  const direction = keyDirections.get(event.code);
  if (!direction || simulation.phase !== 'playing') return;
  event.preventDefault();
  if (event.repeat || keys.has(event.code)) return;
  keys.set(event.code, direction);
  simulation.press(`keyboard:${event.code}`, direction);
  present();
});
window.addEventListener('keyup', (event) => {
  if (!keyDirections.has(event.code)) return;
  keys.delete(event.code);
  simulation.release(`keyboard:${event.code}`);
  if (simulation.phase === 'playing' && ownsFocus()) event.preventDefault();
  present();
});

function releasePointer(event) {
  const pointer = pointers.get(event.pointerId);
  if (!pointer) return;
  pointers.delete(event.pointerId);
  simulation.release(pointer.source);
  if (pointer.button.hasPointerCapture(event.pointerId)) pointer.button.releasePointerCapture(event.pointerId);
  present();
}

for (const [button, direction] of [[leftButton, -1], [rightButton, 1]]) {
  button.addEventListener('pointerdown', (event) => {
    if (simulation.phase !== 'playing' || event.button !== 0) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    const source = `pointer:${event.pointerId}`;
    pointers.set(event.pointerId, { source, direction, button });
    button.setPointerCapture(event.pointerId);
    simulation.press(source, direction);
    present();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, releasePointer);
  button.addEventListener('click', (event) => {
    // Pointer input already moves on pointerdown; native keyboard activation has detail 0.
    if (event.detail !== 0 || event.pointerType || simulation.phase !== 'playing') return;
    const source = `activation:${direction}`;
    simulation.press(source, direction);
    simulation.release(source);
    present();
  });
}

for (const button of document.querySelectorAll('button')) {
  button.addEventListener('keydown', (event) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
  });
}
canvas.addEventListener('pointerdown', () => {
  if (simulation.phase === 'playing') canvas.focus({ preventScroll: true });
});
window.addEventListener('blur', () => pause('focus'));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) pause('focus');
});
gameCard.addEventListener('focusout', () => {
  // Start/Resume intentionally transfer focus from a newly hidden button.
  queueMicrotask(() => {
    if (!ownsFocus()) pause('focus');
  });
});
document.addEventListener('pointerdown', (event) => {
  if (!gameCard.contains(event.target)) pause('focus');
});

function frame(timestamp) {
  if (timedPhases.has(simulation.phase)) {
    accumulator += lastFrame === null ? STEP_MS : Math.min(timestamp - lastFrame, 100);
    while (accumulator >= STEP_MS && timedPhases.has(simulation.phase)) {
      simulation.update(STEP_MS);
      accumulator -= STEP_MS;
    }
    present();
  }
  lastFrame = timestamp;
  requestAnimationFrame(frame);
}

present();
requestAnimationFrame(frame);
