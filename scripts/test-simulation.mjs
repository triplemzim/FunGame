import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, sweptCatch } from '../src/simulation.js';
import { CONTRACT_MS, RANKS } from '../src/rules.js';
import { INTERVIEWS, selectInterviewQuestion } from '../src/interviews.js';

let id = 0;
const item = (type, extra = {}) => ({ id: `qa-${++id}`, type, x: 320, y: 330, vy: 0, halfWidth: 15, halfHeight: 15, ...extra });
const run = (items = [], state = {}, options = {}) => {
  const simulation = createSimulation({ seed: 'qa', spawnEnabled: false, ...options, initialState: { ...state, items } });
  simulation.start();
  return simulation;
};
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-5, `${actual} != ${expected}`);
const passInterview = simulation => {
  assert.equal(simulation.phase, 'interview');
  const question = INTERVIEWS.find(entry => entry.id === simulation.snapshot().interview.id);
  assert.ok(question);
  assert.equal(simulation.answerInterview(question.answer), true);
  assert.equal(simulation.continueInterview(), true);
};

test('reward is processed once, coffee caps at 100 and gives no points, and misses are harmless', () => {
  const simulation = run([item('build'), item('coffee'), item('bug', { x: 96, y: 460 })]);
  simulation.update(16);
  const state = simulation.snapshot();
  assert.equal(state.careerPoints, 30);
  assert.equal(state.promotionProgress, 30);
  assert.equal(state.reputation, 100);
  assert.equal(state.items.length, 0);
  assert.equal(state.stats.rewards, 1);
  assert.equal(state.stats.coffees, 1);
  simulation.update(500);
  assert.equal(simulation.snapshot().careerPoints, 30);
  assert.equal(simulation.drainEvents().filter(event => event.type === 'catch').length, 1);
  assert.equal(simulation.drainEvents().length, 0);
});

test('a collision instance ID cannot apply twice even if duplicated in a QA batch', () => {
  const duplicated = item('build');
  const simulation = run([duplicated, { ...duplicated }]);
  simulation.update(16);
  assert.equal(simulation.snapshot().careerPoints, 30);
});

test('hazard and coffee arithmetic clamps once, including low reputation', () => {
  for (const [reputation, expected] of [[100, 82], [20, 2]]) {
    const simulation = run([item('coffee'), item('bug')], { reputation });
    simulation.update(16);
    assert.equal(simulation.snapshot().reputation, expected);
    assert.equal(simulation.phase, 'playing');
  }
});

test('overlapping hazards apply one hit while rewards and coffee still work during grace', () => {
  const simulation = run([item('bug'), item('bug'), item('coffee'), item('build')]);
  simulation.update(16);
  assert.equal(simulation.snapshot().reputation, 82);
  assert.equal(simulation.snapshot().stats.incidents, 1);
  assert.equal(simulation.snapshot().careerPoints, 30);
  assert.ok(simulation.snapshot().graceRemainingMs > 1480);
  assert.equal(simulation.snapshot().items.length, 0);
});

test('damage grace is checked at collision time just before and exactly at expiry', () => {
  for (const [impactMs, expected] of [[9, 100], [10, 70], [11, 70]]) {
    const simulation = run([item('bug', { y: 315 - impactMs / 10, vy: 100 })], { graceRemainingMs: 10 });
    simulation.update(16);
    assert.equal(simulation.snapshot().reputation, expected);
  }
});

test('swept collision intersects both axes at the same time and catches fast crossing items', () => {
  const example = item('build', { x: 208 });
  assert.equal(sweptCatch(example, 310, 430, 320, 208), null);
  assert.notEqual(sweptCatch(item('build'), 200, 450, 320, 320), null);
  const simulation = run([item('build', { y: 200, vy: 20000 })]);
  simulation.update(16);
  assert.equal(simulation.snapshot().careerPoints, 30);
});

test('39 reputation caps progress and waits; coffee restoring to at least 40 promotes', () => {
  const waiting = run([item('build')], { reputation: 39, promotionProgress: 149 });
  waiting.update(16);
  assert.equal(waiting.snapshot().rankIndex, 0);
  assert.equal(waiting.snapshot().promotionProgress, 150);
  assert.equal(waiting.snapshot().careerPoints, 30);
  assert.equal(waiting.snapshot().promotionPending, true);
  const recovered = run([item('coffee')], { reputation: 28, promotionProgress: 150 });
  recovered.update(16);
  assert.equal(recovered.snapshot().reputation, 40);
  assert.equal(recovered.snapshot().rankIndex, 0);
  assert.equal(recovered.phase, 'interview');
  passInterview(recovered);
  assert.equal(recovered.snapshot().rankIndex, 1);
  assert.equal(recovered.phase, 'promotion');
});

test('promotion carries overflow and resolves only one rank before its transition', () => {
  const simulation = run([item('build')], { promotionProgress: 340, reputation: 100 });
  simulation.update(16);
  assert.equal(simulation.snapshot().rankIndex, 0);
  passInterview(simulation);
  assert.equal(simulation.snapshot().rankIndex, 1);
  assert.equal(simulation.snapshot().promotionProgress, 220);
  assert.equal(simulation.phase, 'promotion');
  const elapsed = simulation.snapshot().elapsedMs;
  simulation.update(300);
  near(simulation.snapshot().elapsedMs, elapsed);
  simulation.pause();
  const transition = simulation.snapshot().transitionRemainingMs;
  simulation.update(5000);
  near(simulation.snapshot().transitionRemainingMs, transition);
  simulation.resume();
  assert.equal(simulation.phase, 'promotion');
});

test('zero reputation demotes once, resets progress and preserves lifetime/highest rank', () => {
  const simulation = run([item('bug'), item('build')], { rankIndex: 3, highestRank: 5, reputation: 20, promotionProgress: 1000, careerPoints: 900 });
  simulation.update(16);
  const state = simulation.snapshot();
  assert.equal(state.phase, 'demotion');
  assert.equal(state.rankIndex, 2);
  assert.equal(state.highestRank, 5);
  assert.equal(state.reputation, 45);
  assert.equal(state.promotionProgress, 0);
  assert.equal(state.careerPoints, 930);
  assert.equal(state.stats.demotions, 1);
  simulation.update(501);
  assert.equal(simulation.snapshot().rankIndex, 2);
});

test('Intern dismissal takes priority over promotion and terminal updates freeze the run', () => {
  const simulation = run([item('bug'), item('build')], { reputation: 20, promotionProgress: 149 });
  simulation.update(16);
  assert.equal(simulation.phase, 'dismissed');
  const stopped = simulation.snapshot();
  simulation.update(999999);
  simulation.press('key', 1);
  simulation.update(999);
  assert.deepEqual(simulation.snapshot(), stopped);
});

test('CEO on the final valid step beats timeout, while zero reputation prevents that promotion', () => {
  const victory = run([item('build')], { rankIndex: 6, promotionProgress: 500, elapsedMs: CONTRACT_MS - 1 });
  victory.update(16);
  assert.equal(victory.phase, 'interview');
  assert.equal(victory.snapshot().remainingMs, 0);
  passInterview(victory);
  assert.equal(victory.phase, 'victory');
  assert.equal(victory.snapshot().rankIndex, 7);
  assert.equal(victory.snapshot().highestRank, 7);
  assert.equal(victory.snapshot().remainingMs, 0);
  const demotion = run([item('build'), item('bug')], { rankIndex: 6, promotionProgress: 500, reputation: 20, elapsedMs: CONTRACT_MS - 1 });
  demotion.update(16);
  assert.equal(demotion.phase, 'demotion');
  assert.equal(demotion.snapshot().rankIndex, 5);
  demotion.update(500);
  assert.equal(demotion.phase, 'contractReview');
  assert.equal(demotion.snapshot().elapsedMs, CONTRACT_MS);
});

test('contract truncates the final step and cannot score an item arriving after expiry', () => {
  const simulation = run([item('build', { y: 314, vy: 100 })], { elapsedMs: CONTRACT_MS - 1 });
  simulation.update(100);
  assert.equal(simulation.phase, 'contractReview');
  assert.equal(simulation.snapshot().careerPoints, 0);
  assert.equal(simulation.snapshot().elapsedMs, CONTRACT_MS);
});

test('pause freezes objects, grace and contract; resume clears held repeat', () => {
  const simulation = run([item('build', { x: 96, y: 10, vy: 100 })], { graceRemainingMs: 1000 });
  simulation.press('key', 1);
  simulation.update(40);
  simulation.pause();
  const paused = simulation.snapshot();
  simulation.update(5000);
  assert.deepEqual(simulation.snapshot(), paused);
  simulation.resume();
  simulation.update(500);
  assert.equal(simulation.snapshot().lane, 3);
  assert.equal(simulation.snapshot().x, 432);
  near(simulation.snapshot().elapsedMs, paused.elapsedMs + 500);
});

test('five retries clear objects, stats, progress, time, input, and feedback', () => {
  const simulation = createSimulation({ seed: 'retry', spawnEnabled: true });
  for (let attempt = 0; attempt < 5; attempt++) {
    simulation.start();
    simulation.press('held', -1);
    simulation.update(1200);
    simulation.reset();
    const state = simulation.snapshot();
    assert.equal(state.phase, 'ready');
    assert.equal(state.x, 320);
    assert.equal(state.items.length, 0);
    assert.equal(state.elapsedMs, 0);
    assert.equal(state.careerPoints, 0);
    assert.equal(state.reputation, 100);
    assert.equal(simulation.drainEvents().length, 0);
  }
});

test('normal seeded spawning provides an early center catch and no opening hazards', () => {
  const simulation = createSimulation({ seed: 123 });
  simulation.start();
  simulation.update(3900);
  const state = simulation.snapshot();
  assert.ok(state.careerPoints >= 30);
  assert.ok(state.stats.firstCatchMs < 5000);
  assert.ok(state.items.every(entry => entry.type !== 'bug'));
});

test('all eight ranks are reachable and progression can be disabled for Stage 2 checks', () => {
  assert.equal(RANKS.length, 8);
  for (let rankIndex = 0; rankIndex < 7; rankIndex++) {
    const simulation = run([item('build')], { rankIndex, promotionProgress: RANKS[rankIndex].target - 30 });
    simulation.update(16);
    assert.equal(simulation.snapshot().rankIndex, rankIndex);
    passInterview(simulation);
    assert.equal(simulation.snapshot().rankIndex, rankIndex + 1);
  }
  const intern = run([item('build')], { promotionProgress: 149 }, { progression: false });
  intern.update(16);
  assert.equal(intern.snapshot().rankIndex, 0);
  assert.equal(intern.phase, 'playing');
});


test('interview freezes the complete run before and after an answer until Continue', () => {
  const simulation = run([item('build'), item('coffee', { x: 96, y: 20, vy: 100 })], { promotionProgress: 120, graceRemainingMs: 900 });
  simulation.press('held', 1);
  simulation.update(16);
  const waiting = simulation.snapshot();
  assert.equal(waiting.phase, 'interview');
  assert.equal(waiting.rankIndex, 0);
  assert.equal(waiting.interview.answered, false);
  assert.equal(waiting.interview.correct, null);
  assert.equal(waiting.interview.feedback, '');
  assert.deepEqual(Object.keys(waiting.interview).sort(), ['answered', 'correct', 'feedback', 'id', 'prompt', 'targetRankIndex'].sort());
  simulation.update(60000);
  simulation.pause();
  simulation.press('fresh', -1);
  assert.deepEqual(simulation.snapshot(), waiting);
  const question = INTERVIEWS.find(entry => entry.id === waiting.interview.id);
  assert.equal(simulation.answerInterview(question.answer), true);
  const answered = simulation.snapshot();
  assert.equal(answered.phase, 'interview');
  assert.equal(answered.interview.answered, true);
  assert.equal(answered.interview.correct, true);
  assert.ok(answered.interview.feedback);
  simulation.update(60000);
  assert.deepEqual(simulation.snapshot(), answered);
  assert.equal(simulation.continueInterview(), true);
  assert.equal(simulation.snapshot().rankIndex, 1);
});

test('wrong answer denies promotion, preserves score/trust, costs one build and rotates the next question', () => {
  const simulation = run([item('build'), item('build', { y: 100, vy: 100 })], { promotionProgress: 120 });
  simulation.update(16);
  const first = simulation.snapshot().interview;
  const question = INTERVIEWS.find(entry => entry.id === first.id);
  simulation.answerInterview(!question.answer);
  assert.equal(simulation.snapshot().interview.correct, false);
  assert.equal(simulation.snapshot().interview.feedback, question.incorrectFeedback);
  assert.equal(simulation.phase, 'interview');
  simulation.continueInterview();
  assert.equal(simulation.phase, 'playing');
  assert.equal(simulation.snapshot().rankIndex, 0);
  assert.equal(simulation.snapshot().careerPoints, 30);
  assert.equal(simulation.snapshot().reputation, 100);
  assert.equal(simulation.snapshot().promotionProgress, 120);
  assert.equal(simulation.snapshot().interview, null);
  assert.ok(simulation.drainEvents().some(event => event.type === 'interviewDenied'));
  simulation.update(2500);
  assert.equal(simulation.phase, 'interview');
  assert.notEqual(simulation.snapshot().interview.id, first.id);
  assert.equal(simulation.snapshot().careerPoints, 60);
});

test('wrong-answer progress penalty discards overflow and duplicate/invalid actions do nothing', () => {
  const simulation = run([item('build')], { promotionProgress: 340 });
  assert.equal(simulation.answerInterview(true), false);
  assert.equal(simulation.continueInterview(), false);
  simulation.update(16);
  const question = INTERVIEWS.find(entry => entry.id === simulation.snapshot().interview.id);
  assert.equal(simulation.continueInterview(), false);
  for (const invalid of ['No', 0, null, undefined]) assert.equal(simulation.answerInterview(invalid), false);
  assert.equal(simulation.snapshot().interview.answered, false);
  const copy = simulation.snapshot().interview;
  copy.answered = true;
  assert.equal(simulation.snapshot().interview.answered, false);
  assert.equal(simulation.answerInterview(!question.answer), true);
  assert.equal(simulation.answerInterview(question.answer), false);
  assert.equal(simulation.continueInterview(), true);
  assert.equal(simulation.snapshot().promotionProgress, 120);
  assert.equal(simulation.continueInterview(), false);
  assert.equal(simulation.snapshot().promotionProgress, 120);
});

test('interview at contract expiry can win CEO, while wrong or non-CEO acceptance reviews the contract', () => {
  const wrong = run([item('build')], { rankIndex: 6, promotionProgress: 500, elapsedMs: CONTRACT_MS - 1 });
  wrong.update(16);
  const question = INTERVIEWS.find(entry => entry.id === wrong.snapshot().interview.id);
  wrong.answerInterview(!question.answer);
  wrong.continueInterview();
  assert.equal(wrong.phase, 'contractReview');
  assert.equal(wrong.snapshot().rankIndex, 6);
  assert.equal(wrong.snapshot().elapsedMs, CONTRACT_MS);
  const accepted = run([item('build')], { promotionProgress: 120, elapsedMs: CONTRACT_MS - 1 });
  accepted.update(16);
  passInterview(accepted);
  assert.equal(accepted.phase, 'promotion');
  accepted.update(700);
  assert.equal(accepted.phase, 'contractReview');
  assert.equal(accepted.snapshot().rankIndex, 1);
  assert.equal(accepted.snapshot().elapsedMs, CONTRACT_MS);
});

test('reset clears interview and deterministic question attempts', () => {
  const simulation = run([item('build')], { promotionProgress: 120 });
  simulation.update(16);
  const first = simulation.snapshot().interview.id;
  simulation.reset();
  assert.equal(simulation.snapshot().interview, null);
  assert.equal(simulation.phase, 'ready');
  assert.equal(simulation.answerInterview(true), false);
  simulation.start();
  simulation.update(16);
  assert.equal(simulation.snapshot().interview.id, first);
  const current = INTERVIEWS.find(entry => entry.id === first);
  simulation.answerInterview(current.answer);
  simulation.continueInterview();
  assert.equal(simulation.continueInterview(), false);
  assert.equal(simulation.snapshot().stats.promotionTimes.length, 1);
});

test('each promotion rank has a rotating mixed Yes/No question pool including the exact lunch example', () => {
  assert.equal(new Set(INTERVIEWS.map(question => question.id)).size, INTERVIEWS.length);
  for (let rank = 1; rank <= 7; rank++) {
    const pool = INTERVIEWS.filter(question => question.targetRankIndex === rank);
    assert.ok(pool.length >= 3);
    assert.ok(pool.some(question => question.answer));
    assert.ok(pool.some(question => !question.answer));
    const rotation = Array.from({ length: 6 }, (_, attempt) => selectInterviewQuestion(rank, attempt, 123));
    assert.equal(new Set(rotation.slice(0, 3).map(question => question.id)).size, 3);
    for (let i = 1; i < rotation.length; i++) assert.notEqual(rotation[i].id, rotation[i - 1].id);
  }
  const lunch = INTERVIEWS.find(question => question.id === 'junior-lunch-outage');
  assert.equal(lunch.prompt, 'Production is down. Should you restart everything and immediately go to lunch?');
  assert.equal(lunch.answer, false);
  assert.equal(lunch.correctFeedback, 'Suspiciously responsible. You’re promoted.');
  assert.equal(lunch.incorrectFeedback, 'Management potential detected. Unfortunately, this is an engineering promotion.');
});
