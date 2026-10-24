import test from 'node:test';
import assert from 'node:assert/strict';
import { createSimulation, sweptCatch } from '../src/simulation.js';
import { CONTRACT_MS, RANKS } from '../src/rules.js';

let id = 0;
const item = (type, extra = {}) => ({ id: `qa-${++id}`, type, x: 320, y: 330, vy: 0, halfWidth: 15, halfHeight: 15, ...extra });
const run = (items = [], state = {}, options = {}) => {
  const simulation = createSimulation({ seed: 'qa', spawnEnabled: false, ...options, initialState: { ...state, items } });
  simulation.start();
  return simulation;
};
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-5, `${actual} != ${expected}`);

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
  assert.equal(recovered.snapshot().rankIndex, 1);
  assert.equal(recovered.phase, 'promotion');
});

test('promotion carries overflow and resolves only one rank before its transition', () => {
  const simulation = run([item('build')], { promotionProgress: 340, reputation: 100 });
  simulation.update(16);
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
    assert.equal(simulation.snapshot().rankIndex, rankIndex + 1);
  }
  const intern = run([item('build')], { promotionProgress: 149 }, { progression: false });
  intern.update(16);
  assert.equal(intern.snapshot().rankIndex, 0);
  assert.equal(intern.phase, 'playing');
});
