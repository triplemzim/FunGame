export const WORLD_WIDTH = 640;
export const WORLD_HEIGHT = 420;
export const LANE_CENTERS = Object.freeze([96, 208, 320, 432, 544]);
export const LANE_COUNT = LANE_CENTERS.length;
export const CATCH_ZONE = Object.freeze({ halfWidth: 36, y: 330, height: 26 });
export const TRANSITION_MS = 110;
export const REPEAT_MS = 180;

// One model serves keyboard and pointer input. Time advances only when updated.
export function createMovement() {
  const held = new Map();
  let lane;
  let x;
  let fromX;
  let transitionElapsed;
  let repeatElapsed;

  function heldDirection() {
    let direction = 0;
    for (const value of held.values()) direction = value;
    return direction;
  }

  function step(direction) {
    const nextLane = Math.max(0, Math.min(LANE_COUNT - 1, lane + direction));
    if (nextLane === lane) return;
    lane = nextLane;
    fromX = x;
    transitionElapsed = x === LANE_CENTERS[lane] ? TRANSITION_MS : 0;
  }

  function advanceTransition(dtMs) {
    transitionElapsed = Math.min(TRANSITION_MS, transitionElapsed + dtMs);
    const progress = transitionElapsed / TRANSITION_MS;
    x = fromX + (LANE_CENTERS[lane] - fromX) * progress;
  }

  function reset() {
    held.clear();
    lane = 2;
    x = LANE_CENTERS[lane];
    fromX = x;
    transitionElapsed = TRANSITION_MS;
    repeatElapsed = 0;
  }

  function press(source, direction) {
    if (direction !== -1 && direction !== 1) {
      throw new RangeError('Movement direction must be -1 or 1.');
    }
    if (held.get(source) === direction) return;
    const previousDirection = heldDirection();
    held.delete(source);
    held.set(source, direction);
    if (direction !== previousDirection) {
      repeatElapsed = 0;
      step(direction);
    }
  }

  function release(source) {
    const previousDirection = heldDirection();
    if (!held.delete(source)) return;
    const direction = heldDirection();
    if (direction !== previousDirection) {
      repeatElapsed = 0;
      if (direction) step(direction);
    }
  }

  function clearInput() {
    held.clear();
    repeatElapsed = 0;
  }

  function update(dtMs) {
    if (!Number.isFinite(dtMs) || dtMs <= 0) return;
    let remaining = dtMs;
    while (remaining > 0) {
      const direction = heldDirection();
      // A long hold against a settled boundary needs no repeated work.
      if (direction && x === LANE_CENTERS[lane]
        && ((lane === 0 && direction < 0) || (lane === LANE_COUNT - 1 && direction > 0))) {
        repeatElapsed = (repeatElapsed + remaining) % REPEAT_MS;
        return;
      }
      const untilRepeat = direction ? REPEAT_MS - repeatElapsed : Infinity;
      const elapsed = Math.min(remaining, untilRepeat);
      advanceTransition(elapsed);
      remaining -= elapsed;
      if (direction) {
        repeatElapsed += elapsed;
        if (repeatElapsed >= REPEAT_MS) {
          repeatElapsed = 0;
          step(direction);
        }
      }
    }
  }

  function snapshot() {
    const direction = Math.sign(LANE_CENTERS[lane] - x);
    return { lane, x, moving: direction !== 0, direction };
  }

  reset();
  return { reset, press, release, clearInput, update, snapshot };
}
