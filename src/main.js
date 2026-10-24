import { createOfficeShell } from './game.js';
import { createMovement, LANE_COUNT } from './movement.js';

const find = (id) => document.getElementById(id);
const gameCard = find('game-card');
const canvas = find('office-canvas');
const startButton = find('start-button');
const resetButton = find('reset-button');
const pauseButton = find('pause-button');
const resumeButton = find('resume-button');
const leftButton = find('move-left');
const rightButton = find('move-right');
const movement = createMovement();
const shell = createOfficeShell(canvas);
const keys = new Map();
const pointers = new Map();
const keyDirections = new Map([['ArrowLeft', -1], ['KeyA', -1], ['ArrowRight', 1], ['KeyD', 1]]);
let phase = 'ready';
let lastFrame = null;
let accumulator = 0;
let announcedLane = -1;
const STEP_MS = 1000 / 60;

function present() {
  const model = movement.snapshot();
  shell.render({ ...model, phase });
  canvas.dataset.lane = String(model.lane + 1);
  canvas.dataset.playerX = model.x.toFixed(2);
  find('lane-status').textContent = `Lane ${model.lane + 1} / ${LANE_COUNT}`;
  const held = [...keys.values(), ...[...pointers.values()].map((pointer) => pointer.direction)];
  leftButton.dataset.pressed = String(phase === 'playing' && held.includes(-1));
  rightButton.dataset.pressed = String(phase === 'playing' && held.includes(1));
  if (phase === 'playing' && !model.moving && model.lane !== announcedLane) {
    announcedLane = model.lane;
    const edge = model.lane === 0 ? ' Left edge.' : model.lane === LANE_COUNT - 1 ? ' Right edge.' : '';
    find('movement-status').textContent = `Lane ${model.lane + 1} of ${LANE_COUNT}.${edge}`;
  }
}

function clearControls() {
  movement.clearInput();
  keys.clear();
  const captured = [...pointers.entries()];
  pointers.clear();
  for (const [id, { button }] of captured) {
    if (button.hasPointerCapture(id)) button.releasePointerCapture(id);
  }
}

function setPhase(nextPhase, { focus = false, reason = 'manual' } = {}) {
  clearControls();
  phase = nextPhase;
  lastFrame = null;
  accumulator = 0;
  const active = phase !== 'ready';
  const paused = phase === 'paused';
  document.body.dataset.state = phase;
  startButton.hidden = active;
  find('session-actions').hidden = !active;
  pauseButton.hidden = phase !== 'playing';
  find('movement-controls').hidden = !active;
  find('pause-overlay').hidden = !paused;
  leftButton.disabled = paused;
  rightButton.disabled = paused;
  find('state-label').textContent = active ? 'FIND YOUR FOOTING' : 'YOUR NEXT BIG THING';
  find('state-title').textContent = paused ? 'A well-earned breather.' : active ? 'Own your lane.' : 'Ready for your first day?';
  find('state-description').textContent = active ? 'Practice your office footwork. Your laptop is your catch zone.' : 'Degree acquired. Production access pending.';
  find('scene-caption').textContent = paused ? 'Your lane will be right here.' : active ? 'Take a lap. Make yourself at home.' : 'New degree. First desk. Big ambitions.';
  find('action-note').textContent = active ? 'A fresh start is always one reset away.' : 'Arrow keys or A / D. Your first move starts here.';
  find('pause-reason').textContent = reason === 'focus' ? "You stepped away. Nothing moved while you were gone." : "Your lane is saved. Resume when you're ready.";
  canvas.setAttribute('aria-label', active ? 'Five-lane office movement playground. Move the intern with arrow keys, A or D, or the left and right buttons.' : 'A new CS graduate at their first desk in a tech office.');
  if (paused) find('movement-status').textContent = 'Paused. Choose Resume Work to continue.';
  else if (active) {
    announcedLane = -1;
    find('movement-status').textContent = 'Move with the left and right controls.';
  } else find('movement-status').textContent = '';
  present();
  if (focus) (paused ? resumeButton : active ? canvas : startButton).focus({ preventScroll: true });
}

function pause(reason = 'manual') {
  if (phase === 'playing') setPhase('paused', { focus: reason === 'manual', reason });
}

startButton.addEventListener('click', () => {
  if (phase !== 'ready') return;
  movement.reset();
  announcedLane = -1;
  setPhase('playing', { focus: true });
});
resetButton.addEventListener('click', () => {
  movement.reset();
  announcedLane = -1;
  setPhase('ready', { focus: true });
});
pauseButton.addEventListener('click', () => pause());
resumeButton.addEventListener('click', () => {
  if (phase === 'paused') setPhase('playing', { focus: true });
});

function ownsFocus() {
  return gameCard.contains(document.activeElement);
}

window.addEventListener('keydown', (event) => {
  if (!ownsFocus() || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.code === 'Escape' && phase === 'playing') {
    event.preventDefault();
    if (!event.repeat) pause();
    return;
  }
  const direction = keyDirections.get(event.code);
  if (!direction || phase !== 'playing') return;
  event.preventDefault();
  if (event.repeat || keys.has(event.code)) return;
  keys.set(event.code, direction);
  movement.press(`keyboard:${event.code}`, direction);
  present();
});
window.addEventListener('keyup', (event) => {
  if (!keyDirections.has(event.code)) return;
  keys.delete(event.code);
  movement.release(`keyboard:${event.code}`);
  if (phase === 'playing' && ownsFocus()) event.preventDefault();
  present();
});

function releasePointer(event) {
  const pointer = pointers.get(event.pointerId);
  if (!pointer) return;
  pointers.delete(event.pointerId);
  movement.release(pointer.source);
  if (pointer.button.hasPointerCapture(event.pointerId)) pointer.button.releasePointerCapture(event.pointerId);
  present();
}

for (const [button, direction] of [[leftButton, -1], [rightButton, 1]]) {
  button.addEventListener('pointerdown', (event) => {
    if (phase !== 'playing' || event.button !== 0) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    const source = `pointer:${event.pointerId}`;
    pointers.set(event.pointerId, { source, direction, button });
    button.setPointerCapture(event.pointerId);
    movement.press(source, direction);
    present();
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, releasePointer);
  button.addEventListener('click', (event) => {
    // Pointer input already moves on pointerdown; native keyboard activation has detail 0.
    if (event.detail !== 0 || event.pointerType || phase !== 'playing') return;
    const source = `activation:${direction}`;
    movement.press(source, direction);
    movement.release(source);
    present();
  });
}

for (const button of document.querySelectorAll('button')) {
  button.addEventListener('keydown', (event) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
  });
}
canvas.addEventListener('pointerdown', () => {
  if (phase === 'playing') canvas.focus({ preventScroll: true });
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
  if (phase === 'playing') {
    accumulator += lastFrame === null ? STEP_MS : Math.min(timestamp - lastFrame, 100);
    while (accumulator >= STEP_MS) {
      movement.update(STEP_MS);
      accumulator -= STEP_MS;
    }
    present();
  }
  lastFrame = timestamp;
  requestAnimationFrame(frame);
}

setPhase('ready');
requestAnimationFrame(frame);
