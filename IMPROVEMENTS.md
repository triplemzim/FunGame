# Career Catcher Improvements Backlog

The user requested an MVP-first pass on 24 October 2026. First deliver a complete playable run with movement, catches and hazards, career progression, three endings, and clean retry. Keep functional controls, clear feedback, fair basic patterns, and reliable pause/reset in that pass. Defer the work below until the playable MVP is ready.

## After the playable MVP

| Priority | Improvement | Why it matters | Status |
| --- | --- | --- | --- |
| High | Tune movement transition/repeat timing using player feedback | Find a comfortable speed on keyboard and touch | Deferred; current values 110 ms / 180 ms |
| High | Measure first catch, promotions, Manager, and skilled CEO timing across seeds | Make the three-minute challenge achievable and engaging | Deferred; starting values from game plan |
| High | Observe roughly five fresh players without coaching | Find confusing goals, unfair hits, and weak replay motivation | Deferred |
| High | Test physical phone touch, multi-touch cancellation, and focus interruption | Confirm real-device input behavior beyond desktop pointer checks | Deferred; shared model and input-routing checks exist |
| Medium | Richer employee reactions, movement lean, catch pop, and rank celebrations | Make catches and consequences feel satisfying | Deferred; keep simple matching feedback in MVP |
| Medium | Cohesive final item art and all seven visual variants | Improve category recognition and personality | Deferred; use clear category placeholders first |
| Medium | Optional sound cues, visible mute, and remembered preference | Add feedback without requiring sound | Deferred |
| Medium | More event-specific engineering jokes and prioritized dialogue | Add comedy without interrupting play | Deferred; concise core messages first |
| Medium | Outcome-specific performance reviews and local personal best | Give each ending personality and encourage retry | Deferred; accurate basic results first |
| Medium | Expanded reduced-motion and low-trust presentation review | Keep effects readable and comfortable | Deferred; retain existing reduced-motion support |
| Release | Fresh-session judge access and full laptop/phone Sites verification | Confirm the actual judging path | Deferred; Site is public and current checkpoints are checked in-app |
| Release | Feature freeze, 60–90 second demo script, and backup recording | Prepare a stable judge handoff | Deferred until MVP and refinement |
| Low | Extra backgrounds, props, events, cosmetics, and online features | Add variety only after core play works well | Deferred |

## Observations to carry forward

- Movement currently shares one model between keyboard and pointer input. Automated checks cover cancellation, focus loss, reset, and held-repeat behavior; these do not establish physical touch comfort.
- A browser QA issue with a stale pause announcement after resume was fixed during Stage 1.
- The public Site identity and previous saved versions should be retained throughout later work.
- Gameplay blockers take priority over this backlog. Add observed issues here with a reproduction and affected checkpoint rather than silently claiming an untested improvement passed.
