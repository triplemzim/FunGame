import { createMovement, LANE_CENTERS, CATCH_ZONE, WORLD_HEIGHT, TRANSITION_MS } from './movement.js';
import { CONTRACT_MS, DAMAGE_GRACE_MS, PROMOTION_REPUTATION, DEMOTION_REPUTATION, PROMOTION_MS, DEMOTION_MS, RANKS, ITEM_TYPES, TERMINAL_PHASES } from './rules.js';

const EPSILON = 1e-7;
const PHYSICS_STEP_MS = 1000 / 60;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function seedNumber(value) {
  if (typeof value === 'number') return value >>> 0;
  let number = 2166136261;
  for (const character of String(value)) number = Math.imul(number ^ character.charCodeAt(0), 16777619);
  return number >>> 0;
}

function seededRandom(seed) {
  let value = seedNumber(seed);
  return () => {
    value += 0x6d2b79f5;
    let result = Math.imul(value ^ value >>> 15, 1 | value);
    result ^= result + Math.imul(result ^ result >>> 7, 61 | result);
    return ((result ^ result >>> 14) >>> 0) / 4294967296;
  };
}

function overlapInterval(from, to, min, max) {
  const delta = to - from;
  if (Math.abs(delta) < EPSILON) return from >= min && from <= max ? [0, 1] : null;
  const a = (min - from) / delta;
  const b = (max - from) / delta;
  const enter = Math.max(0, Math.min(a, b));
  const exit = Math.min(1, Math.max(a, b));
  return enter <= exit + EPSILON ? [enter, exit] : null;
}

// Intersect both axes in time: crossing X later cannot catch an item that passed Y earlier.
export function sweptCatch(item, previousY, nextY, previousX, nextX) {
  const horizontal = overlapInterval(item.x - previousX, item.x - nextX,
    -CATCH_ZONE.halfWidth - item.halfWidth, CATCH_ZONE.halfWidth + item.halfWidth);
  const vertical = overlapInterval(previousY, nextY, CATCH_ZONE.y - item.halfHeight,
    CATCH_ZONE.y + CATCH_ZONE.height + item.halfHeight);
  if (!horizontal || !vertical) return null;
  const enter = Math.max(horizontal[0], vertical[0]);
  return enter <= Math.min(horizontal[1], vertical[1]) + EPSILON ? enter : null;
}

// initialState/spawnEnabled are module-only controlled QA options, never public UI controls.
export function createSimulation({ seed, progression = true, spawnEnabled = true, initialState = null } = {}) {
  const movement = createMovement();
  let phase;
  let phaseBeforePause;
  let rankIndex;
  let highestRank;
  let careerPoints;
  let promotionProgress;
  let reputation;
  let elapsedMs;
  let graceUntilMs;
  let transitionRemainingMs;
  let items;
  let stats;
  let notice;
  let events;
  let sequence;
  let spawnRemainingMs;
  let lastCoffeeSpawnMs;
  let firstSpawn;
  let difficulty;
  let random;
  let activeSeed;
  let usedIds;

  function event(type, text, extra = {}) {
    notice = text;
    events.push({ type, text, message: text, atMs: elapsedMs, ...extra });
  }

  function reset() {
    movement.reset();
    phase = 'ready';
    phaseBeforePause = 'playing';
    rankIndex = 0;
    highestRank = 0;
    careerPoints = 0;
    promotionProgress = 0;
    reputation = 100;
    elapsedMs = 0;
    graceUntilMs = 0;
    transitionRemainingMs = 0;
    items = [];
    stats = { incidents: 0, demotions: 0, coffees: 0, rewards: 0, byType: { build: 0, coffee: 0, bug: 0 }, firstCatchMs: null, promotionTimes: [] };
    notice = 'Degree acquired. Production access pending.';
    events = [];
    sequence = 1;
    usedIds = new Set();
    spawnRemainingMs = 250;
    lastCoffeeSpawnMs = 0;
    firstSpawn = true;
    difficulty = 0;
    activeSeed = seed ?? ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    random = seededRandom(activeSeed);
  }

  function normalizeItem(source) {
    const type = ITEM_TYPES[source.type] ? source.type : 'build';
    let id = source.id;
    if (id == null) {
      do { id = `item-${sequence++}`; } while (usedIds.has(id));
    }
    usedIds.add(id);
    return {
      id,
      type,
      x: Number.isFinite(source.x) ? source.x : LANE_CENTERS[2],
      y: Number.isFinite(source.y) ? source.y : -20,
      halfWidth: source.halfWidth ?? 15,
      halfHeight: source.halfHeight ?? 15,
      vy: source.vy ?? source.speed ?? (350 / 2.8),
    };
  }

  function start() {
    reset();
    if (initialState) {
      rankIndex = progression ? clamp(initialState.rankIndex ?? 0, 0, RANKS.length - 1) : 0;
      highestRank = Math.max(rankIndex, clamp(initialState.highestRank ?? rankIndex, 0, RANKS.length - 1));
      careerPoints = Math.max(0, initialState.careerPoints ?? 0);
      promotionProgress = Math.max(0, initialState.promotionProgress ?? 0);
      reputation = clamp(initialState.reputation ?? 100, 0, 100);
      elapsedMs = clamp(initialState.elapsedMs ?? 0, 0, CONTRACT_MS);
      graceUntilMs = elapsedMs + Math.max(0, initialState.graceRemainingMs ?? 0);
      if (initialState.stats) stats = { ...stats, ...initialState.stats, byType: { ...stats.byType, ...initialState.stats.byType } };
      items = (initialState.items ?? []).map(normalizeItem);
      difficulty = rankIndex;
    }
    phase = 'playing';
    notice = "First day. Don't deploy on Friday.";
  }

  function finish(outcome) {
    if (TERMINAL_PHASES.includes(phase)) return;
    phase = outcome;
    transitionRemainingMs = 0;
    movement.clearInput();
    const text = outcome === 'victory' ? RANKS[7].joke
      : outcome === 'dismissed' ? 'Probation complete. Unfortunately, so is your access.'
        : 'Contract reviewed. Your next promotion is one more run away.';
    event('ending', text, { outcome, rankIndex, highestRank, careerPoints });
  }

  function resolveCareer() {
    if (reputation <= 0) {
      if (rankIndex === 0) finish('dismissed');
      else {
        rankIndex--;
        reputation = DEMOTION_REPUTATION;
        promotionProgress = 0;
        stats.demotions++;
        phase = 'demotion';
        transitionRemainingMs = DEMOTION_MS;
        movement.clearInput();
        event('demotion', 'Your access has been downgraded. Fresh catches, fresh start.', { rankIndex, rankName: RANKS[rankIndex].shortName });
      }
      return;
    }
    const target = RANKS[rankIndex].target;
    if (!progression) {
      promotionProgress = Math.min(promotionProgress, RANKS[0].target);
      return;
    }
    if (target && reputation < PROMOTION_REPUTATION) promotionProgress = Math.min(promotionProgress, target);
    if (target && reputation >= PROMOTION_REPUTATION && promotionProgress >= target) {
      promotionProgress -= target;
      rankIndex++;
      highestRank = Math.max(highestRank, rankIndex);
      stats.promotionTimes.push({ rankIndex, elapsedMs });
      movement.clearInput();
      event('promotion', RANKS[rankIndex].joke, { rankIndex, rankName: RANKS[rankIndex].shortName });
      if (rankIndex === RANKS.length - 1) finish('victory');
      else {
        phase = 'promotion';
        transitionRemainingMs = PROMOTION_MS;
      }
    }
  }

  function applyCollisionBatch(collisions) {
    let damage = 0;
    let recovery = 0;
    let points = 0;
    let acceptedHazard = false;
    collisions.sort((a, b) => a.atMs - b.atMs);
    for (const collision of collisions) {
      const item = collision.item;
      if (item.type === 'bug') {
        if (!acceptedHazard && collision.atMs + EPSILON >= graceUntilMs) {
          damage = 30;
          acceptedHazard = true;
          graceUntilMs = collision.atMs + DAMAGE_GRACE_MS;
          stats.incidents++;
          stats.byType.bug++;
          event('hit', ITEM_TYPES.bug.joke, { itemType: 'bug', reputationChange: -30, x: item.x, y: item.y });
        }
      } else if (item.type === 'coffee') {
        recovery += 12;
        stats.coffees++;
        stats.byType.coffee++;
        event('coffee', ITEM_TYPES.coffee.joke, { itemType: 'coffee', reputationChange: 12, x: item.x, y: item.y });
      } else {
        points += ITEM_TYPES.build.points;
        stats.rewards++;
        stats.byType.build++;
        if (stats.firstCatchMs === null) stats.firstCatchMs = collision.atMs;
        event('catch', ITEM_TYPES.build.joke, { itemType: 'build', points: ITEM_TYPES.build.points, x: item.x, y: item.y });
      }
    }
    reputation = clamp(reputation - damage + recovery, 0, 100);
    careerPoints += points;
    promotionProgress += points;
    resolveCareer();
  }

  function impactAfterMs(item) {
    return Math.max(0, (CATCH_ZONE.y - item.halfHeight - item.y) / item.vy * 1000);
  }

  function laneSafe(lane, impactMs, forHazard = false) {
    const blocked = new Set();
    for (const item of items) {
      if (item.type === 'bug' && Math.abs(impactAfterMs(item) - impactMs) < 450) {
        const nearest = LANE_CENTERS.reduce((best, center, index) => Math.abs(center - item.x) < Math.abs(LANE_CENTERS[best] - item.x) ? index : best, 0);
        blocked.add(nearest);
      }
    }
    if (!forHazard) return !blocked.has(lane);
    blocked.add(lane);
    const playerX = movement.snapshot().x;
    return LANE_CENTERS.some((center, index) => !blocked.has(index)
      && Math.abs(center - playerX) / 112 * TRANSITION_MS + 250 < impactMs);
  }

  function spawn() {
    const fallMs = 2800 - clamp(difficulty / 6, 0, 1) * 1000;
    let type;
    if (firstSpawn) type = 'build';
    else if (reputation < 40 && elapsedMs - lastCoffeeSpawnMs >= 10000) type = 'coffee';
    else {
      const roll = random();
      type = roll < .60 ? 'build' : roll < .70 ? 'coffee' : 'bug';
      if (type === 'bug' && elapsedMs < 4000) type = 'build';
    }
    let lane = firstSpawn ? movement.snapshot().lane : Math.floor(random() * LANE_CENTERS.length);
    if (type === 'bug' || type === 'coffee') {
      const eligible = LANE_CENTERS.map((_, index) => index).filter((index) => laneSafe(index, fallMs, type === 'bug'));
      if (!eligible.length) type = 'build';
      else if (!eligible.includes(lane)) lane = eligible[Math.floor(random() * eligible.length)];
    }
    const vy = (CATCH_ZONE.y + 20) / (fallMs / 1000);
    items.push(normalizeItem({ type, x: LANE_CENTERS[lane], y: -20, vy }));
    if (type === 'coffee') lastCoffeeSpawnMs = elapsedMs;
    firstSpawn = false;
    spawnRemainingMs += 1150 - clamp(difficulty / 6, 0, 1) * 300;
  }

  function step(dtMs) {
    const previousX = movement.snapshot().x;
    const fromTime = elapsedMs;
    movement.update(dtMs);
    const nextX = movement.snapshot().x;
    elapsedMs = Math.min(CONTRACT_MS, elapsedMs + dtMs);
    difficulty += (rankIndex - difficulty) * Math.min(1, dtMs / 3000);
    const collisions = [];
    const processed = new Set();
    for (const item of items) {
      const previousY = item.y;
      item.y += item.vy * dtMs / 1000;
      const fraction = sweptCatch(item, previousY, item.y, previousX, nextX);
      if (fraction !== null && !processed.has(item.id)) {
        processed.add(item.id);
        collisions.push({ item, atMs: fromTime + fraction * dtMs });
      }
    }
    items = items.filter((item) => !processed.has(item.id) && item.y - item.halfHeight <= WORLD_HEIGHT + 20);
    applyCollisionBatch(collisions);
    if (phase !== 'playing') return;
    if (elapsedMs + EPSILON >= CONTRACT_MS) {
      elapsedMs = CONTRACT_MS;
      finish('contractReview');
      return;
    }
    if (spawnEnabled) {
      spawnRemainingMs -= dtMs;
      while (spawnRemainingMs <= EPSILON) spawn();
    }
  }

  function update(dtMs) {
    if (!Number.isFinite(dtMs) || dtMs <= 0 || phase === 'ready' || phase === 'paused' || TERMINAL_PHASES.includes(phase)) return;
    let remaining = dtMs;
    while (remaining > EPSILON && !TERMINAL_PHASES.includes(phase)) {
      if (phase === 'promotion' || phase === 'demotion') {
        const consumed = Math.min(remaining, transitionRemainingMs);
        transitionRemainingMs = Math.max(0, transitionRemainingMs - consumed);
        remaining -= consumed;
        if (transitionRemainingMs <= EPSILON) {
          transitionRemainingMs = 0;
          phase = 'playing';
          if (elapsedMs + EPSILON >= CONTRACT_MS) finish('contractReview');
        }
        continue;
      }
      const activeRemaining = CONTRACT_MS - elapsedMs;
      if (activeRemaining <= EPSILON) {
        elapsedMs = CONTRACT_MS;
        finish('contractReview');
        break;
      }
      const consumed = Math.min(remaining, PHYSICS_STEP_MS, activeRemaining);
      step(consumed);
      remaining -= consumed;
    }
  }

  function pause() {
    if (!['playing', 'promotion', 'demotion'].includes(phase)) return;
    phaseBeforePause = phase;
    phase = 'paused';
    movement.clearInput();
  }

  function resume() {
    if (phase !== 'paused') return;
    movement.clearInput();
    phase = phaseBeforePause;
  }

  function snapshot() {
    return {
      ...movement.snapshot(), phase, rankIndex, rankName: RANKS[rankIndex].shortName,
      highestRank, careerPoints, promotionProgress, promotionTarget: RANKS[rankIndex].target,
      reputation, elapsedMs, remainingMs: Math.max(0, CONTRACT_MS - elapsedMs),
      graceRemainingMs: Math.max(0, graceUntilMs - elapsedMs), transitionRemainingMs,
      promotionPending: progression && reputation < PROMOTION_REPUTATION && promotionProgress >= RANKS[rankIndex].target,
      items: items.map((item) => ({ ...item })),
      stats: { ...stats, byType: { ...stats.byType }, promotionTimes: stats.promotionTimes.map((time) => ({ ...time })) },
      notice, seed: activeSeed,
    };
  }

  reset();
  return {
    get phase() { return phase; },
    start, reset, pause, resume, update, snapshot,
    press(source, direction) { if (phase === 'playing') movement.press(source, direction); },
    release(source) { movement.release(source); },
    clearInput() { movement.clearInput(); },
    drainEvents() { const result = events; events = []; return result; },
  };
}
