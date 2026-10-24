// Reproducible diagnostics, not a model of human skill or a public autoplay mode.
// node scripts/measure-balance.mjs [--details] [--seeds=20]
import { createSimulation } from '../src/simulation.js';
import { INTERVIEWS } from '../src/interviews.js';
import { CONTRACT_MS, ITEM_TYPES, TERMINAL_PHASES } from '../src/rules.js';
import { CATCH_ZONE, LANE_CENTERS, TRANSITION_MS, REPEAT_MS, WORLD_HEIGHT } from '../src/movement.js';

const STEP_MS = 1000 / 60;
const laneSpacing = LANE_CENTERS[1] - LANE_CENTERS[0];
const seedArg = process.argv.find(argument => argument.startsWith('--seeds='));
const seedCount = Number(seedArg?.split('=')[1] ?? 20);
if (!Number.isInteger(seedCount) || seedCount < 1 || seedCount > 100) throw new RangeError('--seeds must be an integer from 1 to 100.');
const details = process.argv.includes('--details');
const seconds = value => value == null ? null : Number((value / 1000).toFixed(2));
const nearestLane = x => LANE_CENTERS.reduce((best, center, lane) =>
  Math.abs(center - x) < Math.abs(LANE_CENTERS[best] - x) ? lane : best, 0);
const entersZone = item => (CATCH_ZONE.y - item.halfHeight - item.y) / item.vy * 1000;
const leavesZone = item => (CATCH_ZONE.y + CATCH_ZONE.height + item.halfHeight - item.y) / item.vy * 1000;
const visible = item => item.y + item.halfHeight >= 0 && item.y - item.halfHeight <= WORLD_HEIGHT;

const policies = [
  { name: 'ideal-visible-reward-chasing', decisionMs: 75, lookaheadMs: Infinity, reactionMs: 25, dangerMs: 330, safetyMs: 250, coffeeBelow: 88 },
  { name: 'reactive-300ms', decisionMs: 300, lookaheadMs: 1250, reactionMs: 150, dangerMs: 450, safetyMs: 300, coffeeBelow: 76 },
  { name: 'safe-and-recovery', decisionMs: 300, lookaheadMs: 2200, reactionMs: 170, dangerMs: 600, safetyMs: 650, coffeeBelow: 88, recoverBelow: 70 },
  { name: 'stationary-middle', decisionMs: 300, stationary: true },
];

function chooseLane(snapshot, held, policy) {
  if (policy.stationary) return 2;
  // Decisions use only objects already on screen, never future random spawns.
  const objects = snapshot.items.filter(visible);
  const hazards = objects.filter(item => ITEM_TYPES[item.type].category === 'hazard');
  const current = snapshot.lane;
  const arrival = lane => {
    const distance = Math.abs(lane - current);
    const finish = Math.abs(LANE_CENTERS[current] - snapshot.x) / laneSpacing * TRANSITION_MS;
    if (!distance) return finish;
    // Conservative extra allowance when an already-held direction may wait for repeat.
    const heldAllowance = held === Math.sign(lane - current) ? REPEAT_MS / 2 : 0;
    return finish + (distance - 1) * REPEAT_MS + TRANSITION_MS + heldAllowance;
  };
  const unsafe = (lane, startMs, endMs) => hazards.some(hazard => nearestLane(hazard.x) === lane
    && entersZone(hazard) <= endMs && leavesZone(hazard) >= startMs);
  const imminent = unsafe(current, 0, policy.dangerMs);
  const candidates = objects.filter(item => {
    const category = ITEM_TYPES[item.type].category;
    return (category === 'reward' || (category === 'coffee' && snapshot.reputation <= policy.coffeeBelow))
      && leavesZone(item) > 0 && entersZone(item) <= policy.lookaheadMs;
  }).sort((a, b) => {
    const urgency = item => leavesZone(item) - (ITEM_TYPES[item.type].category === 'coffee'
      && snapshot.reputation < (policy.recoverBelow ?? 40) ? 1200 : 0);
    return urgency(a) - urgency(b);
  });

  for (const item of candidates) {
    const lane = nearestLane(item.x);
    const travelMs = arrival(lane);
    const deadlineMs = leavesZone(item);
    if (travelMs + policy.reactionMs > deadlineMs) continue;
    if (unsafe(lane, Math.max(0, travelMs - 30), Math.max(travelMs, entersZone(item)) + policy.safetyMs)) continue;
    const direction = Math.sign(lane - current);
    let blocked = false;
    for (let intermediate = current; direction && intermediate !== lane; intermediate += direction) {
      const passMs = arrival(intermediate);
      if (unsafe(intermediate, Math.max(0, passMs - 100), passMs + 100)) { blocked = true; break; }
    }
    if (!blocked && (!imminent || lane !== current)) return lane;
  }
  if (imminent) {
    const safe = LANE_CENTERS.map((_, lane) => lane).filter(lane => !unsafe(lane, 0, policy.safetyMs + 400));
    safe.sort((a, b) => arrival(a) - arrival(b));
    if (safe.length) return safe[0];
  }
  return current;
}

function play(seed, policy, { lowTrust = false } = {}) {
  const simulation = createSimulation({ seed, ...(lowTrust ? { initialState: { reputation: 20 } } : {}) });
  simulation.start();
  let held = 0;
  let desiredLane = 2;
  let nextDecisionMs = 0;
  let wallMs = 0;
  let firstCoffeeSpawnMs = null;
  let firstCoffeeCaughtMs = null;
  let recoveredTrustMs = null;
  let inputPresses = 0;
  let interviewPasses = 0;
  const observedIds = new Set();
  const hazardSpawnCounts = LANE_CENTERS.map(() => 0);
  const hazardWindows = [];
  const pendingDemotions = [];
  const demotionRecoveries = [];
  while (!TERMINAL_PHASES.includes(simulation.phase) && wallMs < CONTRACT_MS + 60000) {
    const snapshot = simulation.snapshot();
    for (const item of snapshot.items) {
      if (observedIds.has(item.id)) continue;
      observedIds.add(item.id);
      const category = ITEM_TYPES[item.type].category;
      if (category === 'coffee' && firstCoffeeSpawnMs === null) firstCoffeeSpawnMs = snapshot.elapsedMs;
      if (category === 'hazard') {
        hazardSpawnCounts[nearestLane(item.x)]++;
        hazardWindows.push({
          entryMs: snapshot.elapsedMs + entersZone(item), exitMs: snapshot.elapsedMs + leavesZone(item),
          blockedLanes: LANE_CENTERS.map((center, lane) => ({ center, lane }))
            .filter(({ center }) => Math.abs(center - item.x) <= CATCH_ZONE.halfWidth + item.halfWidth)
            .map(({ lane }) => lane),
        });
      }
    }
    if (lowTrust && recoveredTrustMs === null && snapshot.reputation >= 40) recoveredTrustMs = snapshot.elapsedMs;
    if (snapshot.phase === 'interview') {
      // Optimistic diagnostic: every quiz is answered correctly without reading time.
      const question = INTERVIEWS.find(entry => entry.id === snapshot.interview.id);
      if (!question) throw new Error(`Missing interview ${snapshot.interview.id}`);
      simulation.answerInterview(question.answer);
      simulation.continueInterview();
      interviewPasses++;
    }
    if (snapshot.phase !== 'playing') {
      if (held) simulation.release('diagnostic');
      held = 0;
    } else {
      if (snapshot.elapsedMs >= nextDecisionMs) {
        desiredLane = chooseLane(snapshot, held, policy);
        nextDecisionMs = snapshot.elapsedMs + policy.decisionMs;
      }
      const direction = Math.sign(desiredLane - snapshot.lane);
      if (direction !== held) {
        if (held) simulation.release('diagnostic');
        held = direction;
        if (held) { simulation.press('diagnostic', held); inputPresses++; }
      }
    }
    simulation.update(STEP_MS);
    for (const event of simulation.drainEvents()) {
      if (event.type === 'coffee' && firstCoffeeCaughtMs === null) firstCoffeeCaughtMs = event.atMs;
      if (event.type === 'demotion') pendingDemotions.push({ originalRank: event.rankIndex + 1, atMs: event.atMs });
      if (event.type === 'promotion') {
        for (const demotion of pendingDemotions) {
          if (demotion.recoveredAtMs == null && event.rankIndex >= demotion.originalRank) {
            demotion.recoveredAtMs = event.atMs;
            demotionRecoveries.push({ rankIndex: demotion.originalRank, demotionSeconds: seconds(demotion.atMs), recoveredSeconds: seconds(event.atMs), recoverySeconds: seconds(event.atMs - demotion.atMs) });
          }
        }
      }
    }
    wallMs += STEP_MS;
  }
  const snapshot = simulation.snapshot();
  const hazard = analyzeHazards(hazardWindows, snapshot.elapsedMs);
  return {
    seed, outcome: snapshot.phase, finalRank: snapshot.rankName, highestRank: snapshot.highestRank,
    points: snapshot.careerPoints, activeSeconds: seconds(snapshot.elapsedMs),
    firstCatchSeconds: seconds(snapshot.stats.firstCatchMs),
    firstPromotionSeconds: seconds(snapshot.stats.promotionTimes[0]?.elapsedMs),
    rank3Seconds: seconds(snapshot.stats.promotionTimes.find(event => event.rankIndex === 3)?.elapsedMs),
    ceoSeconds: snapshot.phase === 'victory' ? seconds(snapshot.elapsedMs) : null,
    incidents: snapshot.stats.incidents, coffees: snapshot.stats.coffees, demotions: snapshot.stats.demotions,
    firstCoffeeSpawnSeconds: seconds(firstCoffeeSpawnMs), firstCoffeeCaughtSeconds: seconds(firstCoffeeCaughtMs),
    recoveredTrustSeconds: seconds(recoveredTrustMs), inputPresses, interviewPasses,
    hazardSpawnCounts, projectedHazardWindows: hazardWindows.length,
    minimumProjectedClearLanes: LANE_CENTERS.length - hazard.maxBlockedLanes,
    projectedZeroClearLaneSeconds: seconds(hazard.zeroClearLaneMs),
    demotionRecoveries, unrecoveredDemotions: pendingDemotions.filter(event => event.recoveredAtMs == null).length,
    _hazardMeasurements: hazard,
    promotions: snapshot.stats.promotionTimes.map(event => ({ rankIndex: event.rankIndex, seconds: seconds(event.elapsedMs) })),
  };
}

// These projected intervals describe geometry, not a proof that a player can reach every clear gap.
function analyzeHazards(windows, activeEndMs) {
  const clipped = windows.map(window => ({ ...window, entryMs: Math.max(0, window.entryMs), exitMs: Math.min(activeEndMs, window.exitMs) }))
    .filter(window => window.exitMs > window.entryMs);
  const clearGapsMs = LANE_CENTERS.map((_, lane) => {
    const occupied = clipped.filter(window => window.blockedLanes.includes(lane)).sort((a, b) => a.entryMs - b.entryMs);
    const gaps = [];
    let end = null;
    for (const window of occupied) {
      if (end !== null && window.entryMs > end) gaps.push(window.entryMs - end);
      end = Math.max(end ?? 0, window.exitMs);
    }
    return gaps;
  });
  const changes = new Map();
  for (const window of clipped) {
    for (const lane of window.blockedLanes) {
      if (!changes.has(window.entryMs)) changes.set(window.entryMs, []);
      if (!changes.has(window.exitMs)) changes.set(window.exitMs, []);
      changes.get(window.entryMs).push([lane, 1]);
      changes.get(window.exitMs).push([lane, -1]);
    }
  }
  const times = [...changes.keys()].sort((a, b) => a - b);
  const counts = LANE_CENTERS.map(() => 0);
  let maxBlockedLanes = 0;
  let zeroClearLaneMs = 0;
  for (let index = 0; index < times.length; index++) {
    for (const [lane, change] of changes.get(times[index])) counts[lane] += change;
    const blocked = counts.filter(count => count > 0).length;
    maxBlockedLanes = Math.max(maxBlockedLanes, blocked);
    if (blocked === LANE_CENTERS.length && index + 1 < times.length) zeroClearLaneMs += times[index + 1] - times[index];
  }
  return { windowMs: windows.map(window => window.exitMs - window.entryMs), clearGapsMs, maxBlockedLanes, zeroClearLaneMs };
}

function distribution(values) {
  const present = values.filter(value => value != null).sort((a, b) => a - b);
  if (!present.length) return { observed: 0, min: null, median: null, max: null };
  const middle = Math.floor(present.length / 2);
  const median = present.length % 2 ? present[middle] : (present[middle - 1] + present[middle]) / 2;
  return { observed: present.length, min: present[0], median: Number(median.toFixed(2)), max: present.at(-1) };
}
const mean = values => Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
function summarize(name, runs) {
  return {
    scenario: name, seeds: runs.length,
    outcomes: Object.fromEntries([...new Set(runs.map(run => run.outcome))].map(outcome => [outcome, runs.filter(run => run.outcome === outcome).length])),
    firstCatchSeconds: distribution(runs.map(run => run.firstCatchSeconds)),
    firstPromotionSeconds: distribution(runs.map(run => run.firstPromotionSeconds)),
    rank3Seconds: distribution(runs.map(run => run.rank3Seconds)),
    ceoSeconds: distribution(runs.map(run => run.ceoSeconds)),
    meanIncidents: mean(runs.map(run => run.incidents)), meanCoffee: mean(runs.map(run => run.coffees)), meanDemotions: mean(runs.map(run => run.demotions)),
    finalHighestRank: distribution(runs.map(run => run.highestRank)),
    failedCEOSeeds: runs.filter(run => run.outcome !== 'victory').map(run => run.seed),
    fastestCEOSeed: runs.filter(run => run.ceoSeconds !== null).sort((a, b) => a.ceoSeconds - b.ceoSeconds)[0]?.seed ?? null,
    slowestCEOSeed: runs.filter(run => run.ceoSeconds !== null).sort((a, b) => b.ceoSeconds - a.ceoSeconds)[0]?.seed ?? null,
    hazards: {
      spawnCountsByLane: LANE_CENTERS.map((_, lane) => runs.reduce((total, run) => total + run.hazardSpawnCounts[lane], 0)),
      projectedDangerWindowSeconds: distribution(runs.flatMap(run => run._hazardMeasurements.windowMs).map(seconds)),
      clearGapSecondsByLane: LANE_CENTERS.map((_, lane) => distribution(runs.flatMap(run => run._hazardMeasurements.clearGapsMs[lane]).map(seconds))),
      minimumProjectedClearLanes: Math.min(...runs.map(run => run.minimumProjectedClearLanes)),
      projectedZeroClearLaneSeconds: Number(runs.reduce((total, run) => total + run.projectedZeroClearLaneSeconds, 0).toFixed(2)),
      zeroClearLaneSeeds: runs.filter(run => run.projectedZeroClearLaneSeconds > 0).map(run => run.seed),
    },
    naturalDemotionRecovery: {
      demotions: runs.reduce((total, run) => total + run.demotions, 0),
      regainedPriorRank: runs.reduce((total, run) => total + run.demotionRecoveries.length, 0),
      recoverySeconds: distribution(runs.flatMap(run => run.demotionRecoveries.map(event => event.recoverySeconds))),
      seedsWithRecovery: runs.filter(run => run.demotionRecoveries.length).map(run => run.seed),
    },
  };
}

const reports = policies.map(policy => {
  const runs = Array.from({ length: seedCount }, (_, index) => play(index + 1, policy));
  return { policy, summary: summarize(policy.name, runs), runs };
});
const recoveryRuns = Array.from({ length: seedCount }, (_, index) => play(index + 1, policies[2], { lowTrust: true }));
const recovery = {
  scenario: 'controlled-low-trust-recovery', initialReputation: 20, seeds: seedCount,
  firstCoffeeSpawnSeconds: distribution(recoveryRuns.map(run => run.firstCoffeeSpawnSeconds)),
  firstCoffeeCaughtSeconds: distribution(recoveryRuns.map(run => run.firstCoffeeCaughtSeconds)),
  reputationAtLeast40Seconds: distribution(recoveryRuns.map(run => run.recoveredTrustSeconds)),
  noEarlierCoffeeBy10sSeeds: recoveryRuns.filter(run => run.firstCoffeeSpawnSeconds >= 10).map(run => run.seed),
  unrecoveredSeeds: recoveryRuns.filter(run => run.recoveredTrustSeconds === null).map(run => run.seed),
};
console.log(JSON.stringify({ note: 'Snapshot-based bots are diagnostics, not human playtest evidence. All interviews are answered correctly immediately: quiz reading time and human success are not measured. Low-trust runs alone use a labeled controlled initial reputation.', stepMs: STEP_MS, policies: policies.map(policy => ({ ...policy, lookaheadMs: policy.lookaheadMs === Infinity ? 'all currently visible items' : policy.lookaheadMs })) }));
for (const report of reports) console.log(JSON.stringify(report.summary));
console.log(JSON.stringify(recovery));
if (details) {
  const readable = ({ _hazardMeasurements, ...run }) => ({ ...run,
    projectedDangerWindowSeconds: distribution(_hazardMeasurements.windowMs.map(seconds)),
    clearGapSecondsByLane: _hazardMeasurements.clearGapsMs.map(gaps => distribution(gaps.map(seconds))),
  });
  console.log(JSON.stringify({ seedDetails: reports.map(({ policy, runs }) => ({ scenario: policy.name, runs: runs.map(readable) })), recoveryRuns: recoveryRuns.map(readable) }));
}
