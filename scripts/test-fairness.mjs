import test from 'node:test';
import assert from 'node:assert/strict';
import { createMovement, LANE_CENTERS } from '../src/movement.js';
import { canSpawnHazard, canSpawnCoffee, isDirectPathSafe } from '../src/fairness.js';

const item = (type, lane, extra = {}) => ({ type, x: LANE_CENTERS[lane], y: -20, vy: 125, halfWidth: 15, halfHeight: 15, ...extra });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('cloning preserves an in-flight transition without sharing mutable state', () => {
  const live = createMovement();
  live.press('right', 1);
  live.update(50);
  const clone = live.clone();
  assert.deepEqual(clone.snapshot(), live.snapshot());
  clone.update(30);
  near(clone.snapshot().x, 320 + 112 * 80 / 110);
  near(live.snapshot().x, 320 + 112 * 50 / 110);
  live.update(30);
  assert.deepEqual(clone.snapshot(), live.snapshot());
  const before = live.snapshot();
  clone.press('left', -1);
  clone.update(110);
  assert.deepEqual(live.snapshot(), before);
});

test('cloning preserves held-repeat progress and held-source priority', () => {
  const live = createMovement();
  live.press('right', 1);
  live.update(170);
  const clone = live.clone();
  for (const model of [live, clone]) {
    model.update(10);
    assert.equal(model.snapshot().lane, 4, 'repeat occurs after the remaining 10 ms');
    model.update(110);
    assert.equal(model.snapshot().x, 544);
    model.press('left', -1);
    model.press('left-alias', -1);
    model.update(35);
    model.release('left-alias');
    model.release('left');
    model.update(110);
    assert.equal(model.snapshot().x, 544, 'releasing both left aliases restores the older right source');
  }
  assert.deepEqual(clone.snapshot(), live.snapshot());
});

test('a timed hazard allows a reachable adjacent escape after reaction time', () => {
  const live = createMovement();
  const before = live.snapshot();
  assert.equal(canSpawnHazard(live, [], item('bug', 2)), true);
  assert.equal(isDirectPathSafe(live, [item('bug', 2)], 1), true);
  assert.deepEqual(live.snapshot(), before, 'testing routes does not advance the live player');
});

test('a simultaneous all-lane wall is rejected without relying on damage grace', () => {
  const live = createMovement();
  live.graceRemainingMs = 1500;
  const wall = LANE_CENTERS.map((_, lane) => item('bug', lane, { y: 270 }));
  assert.equal(canSpawnHazard(live, wall.filter((_, lane) => lane !== 2), wall[2]), false);
});

test('a safe destination does not excuse a blocked transit path', () => {
  const live = createMovement();
  const corridor = [item('bug', 3, { y: 330, vy: 0 })];
  assert.equal(isDirectPathSafe(live, corridor, 4), false);
  assert.equal(isDirectPathSafe(live, corridor, 0), true);
});

test('reaction keeps in-flight movement and existing held input intact', () => {
  const live = createMovement();
  live.press('right', 1);
  live.update(55);
  const before = live.snapshot();
  // The already committed motion reaches this bug before the 250 ms reaction ends.
  assert.equal(canSpawnHazard(live, [], item('bug', 3, { y: 300, vy: 400 })), false);
  assert.deepEqual(live.snapshot(), before);
  live.update(110);
  assert.equal(live.snapshot().lane, 3, 'route testing did not consume the live repeat timer');
});

test('coffee needs an actual safe catch rather than just a reachable final lane', () => {
  const live = createMovement();
  assert.equal(canSpawnCoffee(live, [], item('coffee', 4)), true);
  assert.equal(canSpawnCoffee(live, [], item('coffee', 4, { y: 300, vy: 1000 })), false);
  assert.equal(canSpawnCoffee(live, [item('bug', 3, { y: 330, vy: 0 })], item('coffee', 4)), false);
  assert.equal(canSpawnCoffee(live, [], item('coffee', 2, { y: 300, vy: 1000 })), true);
});

test('stationary and very slow QA items have a bounded safety horizon', { timeout: 1000 }, () => {
  const live = createMovement();
  assert.equal(isDirectPathSafe(live, [item('bug', 0, { y: 330, vy: 0 })], 4), true);
  assert.equal(isDirectPathSafe(live, [item('bug', 0, { y: -20, vy: 0.01 })], 4), false);
  assert.equal(canSpawnCoffee(live, [], item('coffee', 2, { y: 10, vy: 0 })), false);
});
