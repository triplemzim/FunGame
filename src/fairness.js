import { CATCH_ZONE, LANE_CENTERS, REPEAT_MS, TRANSITION_MS } from './movement.js';
import { sweptCatch } from './collision.js';

export const REACTION_MS = 250;
const STEP_MS = 1000 / 60;
const MAX_HORIZON_MS = 5000;
const MIN_HORIZON_MS = REACTION_MS + LANE_CENTERS.length * REPEAT_MS + TRANSITION_MS;
const EPSILON = 1e-7;
const SOURCE = 'spawn-safety';

function dangerWindow(item) {
  const low = CATCH_ZONE.y - item.halfHeight;
  const high = CATCH_ZONE.y + CATCH_ZONE.height + item.halfHeight;
  if (!Number.isFinite(item.x) || !Number.isFinite(item.y) || !Number.isFinite(item.vy)) return false;
  if (item.vy === 0) return item.y >= low && item.y <= high ? { end: Infinity } : null;
  const a = (low - item.y) / item.vy * 1000;
  const b = (high - item.y) / item.vy * 1000;
  const end = Math.max(a, b);
  return end >= 0 ? { end } : null;
}

// Test a conservative, directly controllable route. Input remains unchanged during
// reaction time, then one held source steers to the target and releases there.
export function isDirectPathSafe(movement, hazards, targetLane, coffee = null) {
  if (!Number.isInteger(targetLane) || targetLane < 0 || targetLane >= LANE_CENTERS.length) return false;
  const falling = [];
  let horizon = MIN_HORIZON_MS;
  for (const item of hazards) {
    const window = dangerWindow(item);
    if (window === false) return false;
    if (!window) continue;
    if (Number.isFinite(window.end)) {
      if (window.end > MAX_HORIZON_MS) return false;
      horizon = Math.max(horizon, window.end + STEP_MS);
    }
    falling.push({ ...item });
  }
  let reward = null;
  if (coffee) {
    const window = dangerWindow(coffee);
    if (!window || window === false || (Number.isFinite(window.end) && window.end > MAX_HORIZON_MS)) return false;
    if (Number.isFinite(window.end)) horizon = Math.max(horizon, window.end + STEP_MS);
    reward = { ...coffee };
  }
  horizon = Math.min(horizon, MAX_HORIZON_MS);
  const player = movement.clone();
  let time = 0;
  let steering = false;
  let direction = 0;
  let caughtCoffee = false;

  while (time < horizon - EPSILON) {
    if (!steering && time + EPSILON >= REACTION_MS) {
      player.clearInput();
      steering = true;
    }
    if (steering) {
      const wanted = Math.sign(targetLane - player.snapshot().lane);
      if (wanted !== direction) {
        if (direction) player.release(SOURCE);
        direction = wanted;
        if (direction) player.press(SOURCE, direction);
      }
    }
    const dt = Math.min(STEP_MS, horizon - time, steering ? Infinity : REACTION_MS - time);
    const fromX = player.snapshot().x;
    player.update(dt);
    const nextX = player.snapshot().x;
    for (const item of falling) {
      const fromY = item.y;
      item.y += item.vy * dt / 1000;
      if (sweptCatch(item, fromY, item.y, fromX, nextX) !== null) return false;
    }
    if (reward && !caughtCoffee) {
      const fromY = reward.y;
      reward.y += reward.vy * dt / 1000;
      caughtCoffee = sweptCatch(reward, fromY, reward.y, fromX, nextX) !== null;
    }
    time += dt;
  }
  const result = player.snapshot();
  return result.lane === targetLane && !result.moving && (!coffee || caughtCoffee);
}

export function canSpawnHazard(movement, items, candidate) {
  const hazards = [...items.filter((item) => item.type === 'bug'), candidate];
  return LANE_CENTERS.some((_, lane) => isDirectPathSafe(movement, hazards, lane));
}

export function canSpawnCoffee(movement, items, candidate) {
  const lane = LANE_CENTERS.reduce((best, center, index) =>
    Math.abs(center - candidate.x) < Math.abs(LANE_CENTERS[best] - candidate.x) ? index : best, 0);
  return isDirectPathSafe(movement, items.filter((item) => item.type === 'bug'), lane, candidate);
}
