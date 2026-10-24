# Career Catcher Improvements Backlog

The user requested an MVP-first pass on 24 October 2026. The complete MVP now implements movement, catches and hazards, all eight ranks, three endings, and clean retry; see DEVELOPMENT_LOG.md for verification and deployment status. Keep functional controls, clear feedback, fair basic patterns, and reliable pause/reset in that pass. Defer the work below until the playable MVP is ready.

## After the playable MVP

| Priority | Improvement | Why it matters | Status |
| --- | --- | --- | --- |
| High | Tune movement transition/repeat timing using player feedback | Find a comfortable speed on keyboard and touch | Deferred; current values 110 ms / 180 ms |
| High | Measure first catch, promotions, Manager, and skilled CEO timing across seeds | Make the three-minute challenge achievable and engaging | Stage 4 automated baseline measured; human tuning remains; see BALANCE_REPORT.md |
| High | Observe roughly five fresh players without coaching | Find confusing goals, unfair hits, and weak replay motivation | Deferred |
| High | Test physical phone touch, multi-touch cancellation, and focus interruption | Confirm real-device input behavior beyond desktop pointer checks | Deferred; shared model and input-routing checks exist |
| Medium | Richer employee reactions, movement lean, catch pop, and rank celebrations | Make catches and consequences feel satisfying | Deferred; keep simple matching feedback in MVP |
| Medium | Cohesive final item art and all seven visual variants | Improve category recognition and personality | Deferred; use clear category placeholders first |
| High | Event sound cues, visible mute, and remembered preference | Make catches, hits, and career events audible | Implemented locally; public sound release pending |
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

## MVP implementation notes

- Core simulation, three clear item categories, all eight engineering ranks, promotion/demotion consequences, contract clock, endings, and retry are implemented. Sound has now been added at the user’s request; personal best and the additional four visual item variants remain deferred.
- Five ideal seeded bot runs reached CEO in roughly 117–145 active seconds. First promotion was faster than the human target in several ideal runs; measure real players before changing balance.
- Phone QA moved Pause into the playfield heading so it is reachable without scrolling below the action.
- Human fun, physical phone interruption, and judge-specific access remain unverified; automated feasibility checks are not fresh-player sessions.

## Player engagement feedback

The player reported that repeating only builds, coffee, and bugs feels boring. They suggested consequences for missed good items, including a popup and demotion after three misses in a row, and requested sound. Sound is being implemented immediately. The miss-rule suggestions below are design proposals, not current runtime behavior.

- **Proposed miss warning:** three consecutive missed builds trigger a brief HR warning and a Team trust penalty. A build catch resets the counter. Keep coffee optional, especially at full trust. Use the existing zero-trust demotion/dismissal rules initially; a forced demotion after exactly three misses needs fair-catch and Intern behavior defined.
- **Proposed earned action:** consecutive catches charge a Debug ability; a keyboard/touch action spends it to clear an approaching bug. This adds a decision the player controls.
- **Proposed short events:** occasional release windows offer bonus rewards with clearly signaled risk. Keep events brief and avoid obstructing the lane controls.
- **Proposed meaningful pickups:** introduce a shield or brief slow-time effect so additional item types change decisions, not just appearance.

Retain the no-penalty miss behavior until a replacement rule is deliberately selected and tested against rewards that may be unsafe to chase.
