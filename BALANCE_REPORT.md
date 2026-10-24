# Career Catcher Stage 4 Balance Report

Status: In progress. Automated measurements are development evidence; player comfort and perceived fairness still need playtest feedback.

## Baseline

The baseline uses the MVP simulation from source `8aa3799b533e90c851031557e8e642719b82c50a` (public Sites version 4). The diagnostic script runs seeds 1–20 through ordinary press/release movement. It observes currently visible items, never future random spawns, and does not teleport the employee or award points directly.

These policies still know exact object geometry. Their results establish feasibility and reproducibility rather than human success rates or enjoyment.

| Policy | CEO wins | CEO active seconds median | Mean incidents | Mean coffee | Mean demotions |
| --- | ---: | ---: | ---: | ---: | ---: |
| Visible reward chasing | 20/20 | 125.13 | 1.25 | 4.55 | 0 |
| Decisions every 300 ms | 20/20 | 125.13 | 0.10 | 3.80 | 0 |
| Safety and recovery | 20/20 | 125.35 | 0.15 | 3.20 | 0 |
| Stationary middle lane | 0/20 | — | 5.90 | 2.45 | 1 |

The stationary policy ended with 13 dismissals and seven contract reviews. Its highest rank never exceeded Software Engineer; standing still did not provide immunity or a CEO route in these runs.

| Milestone | Baseline diagnostic result | Design target and interpretation |
| --- | --- | --- |
| First catch | 2.93 seconds in every normal run | Within 5 seconds; passed in the tested opening |
| First promotion | Median 8.68 seconds; range 7.53–15.58 for moving policies | Human target 15–20 seconds; not established by these bots |
| Senior Software Engineer | Median 37.92 seconds; range 28.27–48.13 | Human target 45–60 seconds; player measurements pending |
| CEO | Range 109.60–144.45 active seconds | Achievable before the 180-second contract in all moving-policy runs |
| Recovery from 20 trust | All 20 controlled runs reached at least 40; median 17.88 seconds, range 7.53–23.63 | Recovery is feasible with the tested policy; not a normal-run starting condition |

Controlled low-trust runs first saw coffee at 1.40–10.60 active seconds and caught it at 4.08–13.28 seconds. Forcing coffee when trust drops below 40 is immediate if no coffee has appeared during the preceding 10 active seconds; it does not require another 10 seconds spent below 40.

## Fairness findings

A separate baseline probe covered seeds 1–12 at starting ranks 0, 3, and 6, observing 1,654 hazards. The minimum projected interval with no hazard in the catch strip was 562 ms; the longest individual danger window was 448 ms. No unavoidable normal-pattern counterexample was found in that bounded probe.

The old placement heuristic nevertheless underestimates held travel across several lanes and checks destinations without checking the transit path. A four-lane held journey takes 650 ms, while the heuristic estimated 440 ms. Its fixed impact-time neighborhood also omits the complete time an item overlaps the catch strip.

Stage 4 replaces that estimate with conservative direct-path checks using cloned movement state and the same swept collision geometry as actual play. Damage grace does not count as a safe route. Coffee placement must have a safe path that actually catches the cup. A rejected hazard or coffee candidate falls back to a reward; the existing spawn interval and base category probabilities are retained. This can change later seeded outcomes because accepted lanes and random draws change.

The check tests five direct routes through reaction, transit, and waiting. It preserves held-input order, repeat timing, and movement already in flight without advancing the live player. It may reject a valid but more complicated zigzag route, or reject a candidate because an older hazard is already unavoidable during the reaction interval. That conservative rejection is intentional. It is not an exhaustive path planner.

## Post-change measurements

Seeds 1–20 were rerun with the same policies after the path guard changed.

| Policy | CEO wins | CEO seconds median | CEO seconds range | Mean incidents |
| --- | ---: | ---: | --- | ---: |
| Visible reward chasing | 20/20 | 127.58 | 108.75–150.05 | 1.15 |
| Decisions every 300 ms | 20/20 | 127.17 | 109.60–141.00 | 0.15 |
| Safety and recovery | 20/20 | 126.93 | 108.75–150.05 | 0.20 |
| Stationary middle lane | 0/20 | — | — | 6.55 |

First catch stayed at 2.93 seconds and moving-policy first promotion stayed at median 8.68 seconds. Senior Software Engineer medians were 38.34, 37.34, and 38.86 seconds respectively. These diagnostic timings remain faster than the directional human targets; those targets are still unverified.

The stationary policy had 11 dismissals, nine contract reviews, and 24 demotions. Five of those demotions were followed by regaining the prior rank, in 10.25–70.05 active seconds (median 24.05). This is limited recovery evidence from that policy, not a human recovery success rate.

All 20 controlled low-trust runs again restored trust to at least 40, with the same 17.88-second median. No recovery failures were observed in that controlled set.

The 300 ms policy observed hazard counts `[155, 170, 150, 126, 166]` across lanes 1–5. At least four lane centers were outside projected hazard danger windows at every sampled interval; no interval with all lane centers blocked was found. That occupancy result alone does not prove reachability—the live placement guard separately checks movement paths. Projected individual danger windows were approximately 0.29–0.45 seconds.

Eight targeted fairness/clone checks passed, as did the existing 38 movement, simulation, and control checks. Browser/package/hosting verification belongs to the release checkpoint in the development log.

## Selected values

Retain the existing values while human movement/pacing feedback is pending:

- Lane transition 110 ms; held repeat 180 ms.
- Promotion targets 150, 220, 280, 340, 400, 460, and 520 points.
- Spawn interval gradually changes from 1.15 to 0.85 seconds; fall time from 2.8 to 1.8 seconds.
- Reward/coffee/hazard mix 60% / 10% / 30%, with a safe opening and forced recovery rule.
- New placement validation uses a 250 ms reaction margin and actual movement state.

Do not slow the game or raise promotion targets solely to make an exact-geometry bot match a human pacing target. Record player observations before that tuning decision.

## Reproduce

```sh
node scripts/measure-balance.mjs
node scripts/measure-balance.mjs --details --seeds=20
```

Post-change measurements, regression checks, and hosted verification will be recorded with the Stage 4 checkpoint in [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md). Remaining presentation work stays in [IMPROVEMENTS.md](IMPROVEMENTS.md).
