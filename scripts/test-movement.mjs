import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORLD_WIDTH, WORLD_HEIGHT, LANE_CENTERS, LANE_COUNT, CATCH_ZONE,
  TRANSITION_MS, REPEAT_MS, createMovement,
} from '../src/movement.js';

test('starts centered in a five-lane world with a bounded catch zone', () => {
  const movement = createMovement();
  assert.equal(WORLD_WIDTH, 640);
  assert.equal(WORLD_HEIGHT, 420);
  assert.equal(LANE_COUNT, 5);
  assert.deepEqual(movement.snapshot(), { lane: 2, x: 320, moving: false, direction: 0 });
  assert.ok(LANE_CENTERS[0] - CATCH_ZONE.halfWidth >= 0);
  assert.ok(LANE_CENTERS.at(-1) + CATCH_ZONE.halfWidth <= WORLD_WIDTH);
  assert.ok(CATCH_ZONE.y + CATCH_ZONE.height <= WORLD_HEIGHT);
});

test('a press chooses one lane immediately and moves there continuously in 110 ms', () => {
  const movement = createMovement();
  movement.press('ArrowRight', 1);
  assert.deepEqual(movement.snapshot(), { lane: 3, x: 320, moving: true, direction: 1 });
  movement.update(TRANSITION_MS / 2);
  assert.ok(movement.snapshot().x > 320 && movement.snapshot().x < 432);
  movement.update(TRANSITION_MS / 2);
  assert.deepEqual(movement.snapshot(), { lane: 3, x: 432, moving: false, direction: 0 });
});

test('held repeat follows elapsed time and ignores native repeat presses', () => {
  const movement = createMovement();
  movement.press('ArrowRight', 1);
  movement.update(REPEAT_MS - 1);
  for (let repeat = 0; repeat < 10; repeat++) movement.press('ArrowRight', 1);
  assert.equal(movement.snapshot().lane, 3);
  movement.update(1);
  assert.deepEqual(movement.snapshot(), { lane: 4, x: 432, moving: true, direction: 1 });
  movement.update(TRANSITION_MS);
  assert.equal(movement.snapshot().x, 544);
});

test('long holds clamp at both boundaries without wrapping or overshoot', () => {
  const movement = createMovement();
  movement.press('right', 1);
  movement.update(60_000);
  assert.deepEqual(movement.snapshot(), { lane: 4, x: 544, moving: false, direction: 0 });
  movement.press('left', -1);
  movement.update(60_000);
  assert.deepEqual(movement.snapshot(), { lane: 0, x: 96, moving: false, direction: 0 });
});

test('a fast reversal starts from actual position and returns toward the adjacent target', () => {
  const movement = createMovement();
  movement.press('right', 1);
  movement.update(40);
  const turningX = movement.snapshot().x;
  movement.press('left', -1);
  assert.equal(movement.snapshot().x, turningX);
  assert.equal(movement.snapshot().lane, 2);
  assert.equal(movement.snapshot().direction, -1);
  movement.update(55);
  assert.ok(movement.snapshot().x < turningX && movement.snapshot().x > 320);
  movement.update(55);
  assert.equal(movement.snapshot().x, 320);
});

test('same-direction keyboard and pointer aliases neither double step nor restart repeat', () => {
  const movement = createMovement();
  movement.press('ArrowRight', 1);
  movement.update(120);
  movement.press('KeyD', 1);
  movement.press('pointer:4', 1);
  assert.equal(movement.snapshot().lane, 3);
  movement.release('ArrowRight');
  movement.update(59);
  assert.equal(movement.snapshot().lane, 3);
  movement.update(1);
  assert.equal(movement.snapshot().lane, 4);
});

test('last held direction wins and releasing it resumes the remaining direction afresh', () => {
  const movement = createMovement();
  movement.press('KeyA', -1);
  movement.update(TRANSITION_MS);
  movement.press('pointer:9', 1);
  movement.update(60);
  const turningX = movement.snapshot().x;
  movement.release('pointer:9');
  assert.deepEqual(movement.snapshot(), { lane: 1, x: turningX, moving: true, direction: -1 });
  movement.update(REPEAT_MS - 1);
  assert.equal(movement.snapshot().lane, 1);
  movement.update(1);
  assert.equal(movement.snapshot().lane, 0);
});

test('clearing input finishes the current transition without stale repeats', () => {
  const movement = createMovement();
  movement.press('pointer:2', 1);
  movement.update(40);
  const beforeClear = movement.snapshot();
  movement.clearInput();
  assert.deepEqual(movement.snapshot(), beforeClear);
  movement.update(2_000);
  assert.deepEqual(movement.snapshot(), { lane: 3, x: 432, moving: false, direction: 0 });
  movement.release('pointer:2');
  movement.press('KeyA', -1);
  assert.equal(movement.snapshot().lane, 2);
  movement.update(REPEAT_MS - 1);
  assert.equal(movement.snapshot().lane, 2);
});

test('reset clears position, targets, and held sources', () => {
  const movement = createMovement();
  movement.press('KeyA', -1);
  movement.press('pointer:5', 1);
  movement.update(75);
  movement.reset();
  movement.update(2_000);
  assert.deepEqual(movement.snapshot(), { lane: 2, x: 320, moving: false, direction: 0 });
  movement.press('KeyA', -1);
  assert.equal(movement.snapshot().lane, 1);
});

test('large and small updates produce the same movement across a held-repeat boundary', () => {
  const large = createMovement();
  const small = createMovement();
  large.press('right', 1);
  small.press('right', 1);
  large.update(250);
  for (let frame = 0; frame < 25; frame++) small.update(10);
  assert.deepEqual(large.snapshot(), small.snapshot());
});

test('rapid alternating inputs keep actual position bounded and never jump on input', () => {
  const movement = createMovement();
  for (let turn = 0; turn < 500; turn++) {
    const previousX = movement.snapshot().x;
    movement.press('alternating', turn % 2 ? -1 : 1);
    assert.equal(movement.snapshot().x, previousX);
    movement.update(3 + turn % 23);
    const { lane, x } = movement.snapshot();
    assert.ok(Number.isInteger(lane) && lane >= 0 && lane < LANE_COUNT);
    assert.ok(x >= LANE_CENTERS[0] && x <= LANE_CENTERS.at(-1));
  }
});
