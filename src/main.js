import { createOfficeShell } from './game.js';

const canvas = document.querySelector('#office-canvas');
const startButton = document.querySelector('#start-button');
const resetButton = document.querySelector('#reset-button');
const label = document.querySelector('#state-label');
const title = document.querySelector('#state-title');
const description = document.querySelector('#state-description');
const sceneCaption = document.querySelector('#scene-caption');
const actionNote = document.querySelector('#action-note');
const shell = createOfficeShell(canvas);
let state = 'ready';

function setState(nextState, { moveFocus = false } = {}) {
  state = nextState;
  const started = state === 'playing';
  document.body.dataset.state = state;
  label.textContent = started ? 'YOUR FIRST CHAPTER' : 'YOUR NEXT BIG THING';
  title.textContent = started ? "You're hired. Settle in." : 'Ready for your first day?';
  description.textContent = started ? 'Your first desk. A fresh start. Big things ahead.' : 'The corner office has to start somewhere.';
  sceneCaption.textContent = started ? 'Officially part of the furniture.' : 'Small desk. Big ambitions.';
  actionNote.textContent = started ? 'Need a fresh start? Reset your workday.' : 'Clock in. Make yourself at home.';
  startButton.hidden = started;
  resetButton.hidden = !started;
  shell.setState(state);
  if (moveFocus) (started ? resetButton : startButton).focus({ preventScroll: true });
}

startButton.addEventListener('click', () => {
  if (state === 'ready') setState('playing', { moveFocus: true });
});
resetButton.addEventListener('click', () => {
  if (state === 'playing') setState('ready', { moveFocus: true });
});

for (const button of [startButton, resetButton]) {
  button.addEventListener('keydown', (event) => {
    if (event.repeat && (event.key === 'Enter' || event.key === ' ')) event.preventDefault();
  });
}

setState('ready');
