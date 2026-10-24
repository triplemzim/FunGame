# Career Catcher — Development Stages

This is the working development checklist for the [game plan](GAME_PLAN.md). The plan defines the rules; this document defines what to build and test in each iteration. Optimize every stage for the hackathon's two judging priorities: fun to play and attention to detail.

The character is a fresh CS graduate starting as a Software Engineering Intern. The eight-rank career is **Intern → Junior Software Engineer → Software Engineer → Senior Software Engineer → Tech Lead → Engineering Manager → CTO → CEO**. Software and agentic engineering supply the achievements, hazards, props, and humor throughout; graduation is the opening backstory rather than an extra rank.

## How we will work

Build one stage per development iteration unless several are explicitly requested together. Finish its implementation, run its checks, and deliver a playable checkpoint with short testing instructions. Use feedback to fix that stage before expanding the game. A failed check keeps the stage open.

Each handoff includes the playable URL or local preview, what changed, what to try, completed checks, known limitations, and the proposed next stage. A completed code change alone does not establish that a stage is fun or that it works in ChatGPT Sites.

Save a source checkpoint after each passing stage. For hosted checkpoints, record the source commit, Sites version, deployment URL, audience, and verification result. Reuse the same Site project. Retain the last working release so a broken experiment can be reverted without rebuilding the game.

Statuses: **Not started → In progress → Ready for playtest → Complete**. Use **Needs fixes** when a playtest exposes a blocking issue. Mark complete only when the stated exit criteria pass; record unverified claims explicitly.

## Stage overview

| Stage | Playable checkpoint | Main question | Status |
| --- | --- | --- | --- |
| 0 — Foundation and Sites | Tech-office shell with working start/reset | Can we open the intended game surface? | Complete |
| 1 — Movement | Graduate intern moves across five lanes | Does controlling the character feel responsive? | Complete |
| 2 — Catch and dodge | Basic timed arcade run with retry | Are catches satisfying and hazards understandable? | Complete |
| 3 — Complete career | All ranks, consequences, and endings | Can the whole game run correctly? | Complete |
| 4 — Fairness and pacing | Balanced, repeatable three-minute challenge | Is success earned and another attempt appealing? | Not started |
| 5 — Personality and craft | Cohesive art, reactions, sound, and comedy | Does each interaction show care? | Not started |
| 6 — Fresh-player refinement | Revised build after observed play | Do new players enjoy it without coaching? | Not started |
| 7 — Judge release | Verified stable Sites release and demo | Is the experience ready for judging? | Not started |

The first complete game arrives at Stage 3. Stages 4–6 are core hackathon work, not optional polish. Stretch features remain deferred until Stage 7 passes.

## Stage 0 — Foundation and Sites

**Build**

- Inspect repository instructions and the existing working tree. Verify the selected `triplemzim/FunGame` remote before synchronizing source; preserve existing work.
- Create the static HTML/CSS/JavaScript structure and a script that produces the complete `dist/` output.
- Add the responsive tech-office shell, CS-graduate/first-day cue, visible Start First Day button, concise objective, and a basic reset to the ready screen.
- Inspect any hosting manifest; register once only if necessary. Deploy the minimal shell through the Sites workflow and preserve its identity.
- Establish a simple development check log with source/version references and observed issues.

**Try it**

Open the shell, start, reset, and reload. Repeat at a narrow phone width and in the actual ChatGPT Sites viewing experience.

**Checks and exit criteria**

- All packaged scripts, styles, and assets load successfully.
- Start/reset responds and does not create duplicate interfaces or listeners.
- The main action is visible without scrolling past introductory content.
- A deployment is confirmed and its actual ChatGPT viewing behavior is recorded. Resolve platform-blocking issues before treating Sites support as established.
- Current access is documented; judge access remains a final release check.

**Handoff:** tech-office shell URL, platform check results, and the source checkpoint. Falling objects and career logic are not part of this stage.

## Stage 1 — Responsive movement

**Build**

- Five lanes, a visible catch zone, and the graduate-intern placeholder with a lanyard/laptop silhouette.
- Arrow/A/D movement with quick lane transitions and controlled held-input repeat.
- Touch buttons using the same movement rules, including pressed states, edge clamping, and pointer cancellation.
- Focus handling, explicit pause/resume, and clearing held inputs when focus is lost.
- Logical game coordinates and responsive rendering so device size does not change movement rules.

**Try it**

Move one lane at a time, hold across the floor, reverse rapidly, and press against both boundaries. Repeat with touch. Switch away while holding a control, then return and resume.

**Checks and exit criteria**

- Movement begins promptly and lands in the intended lane; no overshoot, wrap, or stuck input.
- Keyboard and touch give equivalent movement behavior.
- Returning to the game never moves the employee using stale input.
- Buttons remain usable without covering the character or moving the page unexpectedly.
- Resize preserves a valid position and catch zone.

**Handoff:** a movement playground and a request for specific control feedback: too slow, too twitchy, or comfortable. Fix uncomfortable movement before adding difficulty.

## Stage 2 — Catch, dodge, and retry

**Build**

- Green CI build reward, coffee, and production bug hazard with clear placeholder silhouettes.
- Falling motion, collision handling, object cleanup, score, reputation, and the 1.5-second damage grace window.
- The 180-second active clock, dismissal at zero reputation, contract-review ending, and restart.
- A simple HUD with reputation labeled Team trust and immediate catch/hit feedback. Add basic reaction and feedback now; richer art and sound come later.
- Pause freezes falling items, grace timers, spawning, and contract time.

This checkpoint stays at Intern. Promotions and higher-rank demotions are introduced together in Stage 3 so incomplete progression rules do not accidentally become the final design.

**Try it**

Catch each category, deliberately miss each category, take repeated hits, recover with coffee, pause with objects falling, and restart several times. Let one run reach the contract review.

**Checks and exit criteria**

- Each object applies its effect once and then disappears.
- A miss has no penalty; coffee caps reputation correctly.
- Multiple overlapping hazards respect the damage grace window.
- Visible movement and the actual catch zone agree; fast objects do not skip collisions.
- Dismissal and timeout stop spawning and scoring immediately.
- Five consecutive retries produce clean runs with no accelerated spawning or duplicate animation loops.
- Focus loss and pause consume no contract time.

**Handoff:** the first basic arcade loop and a short list of confusing catches or hits found during play.

## Stage 3 — Complete career and endings

**Build**

- All eight engineering-to-leadership ranks with data-driven progress targets from the game plan.
- Separate lifetime score and next-promotion progress, reputation gating, and promotion-pending feedback.
- Promotion transitions and simple rank props; demotion resets promotion progress and restores reputation as specified.
- CEO victory, dismissal, contract review, and a shared results/retry structure.
- Highest-rank and final-rank tracking, incidents, demotions, active run time, and catches by item ID for later engineering reviews.
- Explicit state transitions and the collision/outcome ordering defined in the game plan.

**Try it**

Earn early promotions, catch hazards until a demotion, then regain the title with fresh catches. Experience all three endings. Use controlled development scenarios to reach difficult edge cases without waiting for random spawns.

**Checks and exit criteria**

- A complete career can reach CEO; all three endings are reachable and restart correctly.
- Demotion cannot immediately promote the player again.
- At 39 reputation, a filled promotion bar waits; at 40, it can promote.
- Overflow and capped progress follow the plan, with no unexpected multi-rank jumps.
- Simultaneous reward/hazard/coffee and final-step outcomes resolve consistently.
- Promotion/demotion pauses freeze gameplay and resume once.
- Highest rank persists within the run even after demotion; the results reflect actual events.

Use a small set of automated checks for the career rules and terminal-state ordering because these are easy to regress. Keep development scenario controls outside the judge-facing interface. A forced QA ending does not establish that normal-play pacing is good.

**Handoff:** the first complete game, with notes on which endings were reached naturally and which required controlled QA.

## Stage 4 — Fair challenge and promotion pacing

**Build and tune**

- Fair spawn selection using projected impact times and reachable escape positions.
- The safe opening, gradual difficulty changes, and coffee recovery rule.
- Reward choices that tempt movement near avoidable hazards.
- Spawn mix, fall times, progress targets, and speed settings tuned together.
- Local development timing records for first catch, promotions, run outcome, and repeatable unfair patterns. No analytics service is required.

**Try it**

Play several normal runs with different seeds, including deliberate safe play, aggressive reward chasing, and recovery after incidents. Repeat representative runs on keyboard and touch. Reproduce any suspected unavoidable hit.

**Checks and exit criteria**

- First catch is available within 5 seconds; promotion to Junior Software Engineer targets 15–20 seconds and Senior Software Engineer roughly 45–60 seconds.
- CEO is achievable through normal skilled play within the 180-second contract.
- Hazards can challenge every lane, and tested patterns leave a reachable safe route.
- Standing still is not a reliable immunity strategy.
- Low reputation has a credible recovery opportunity; demotion does not make the rest of the run pointless.
- Players can identify how to avoid the hits they take. Unexplained or unavoidable hits are investigated before adding content.
- Record measured pacing and any deliberate departures from targets rather than silently claiming targets passed.

**Handoff:** measured results, the selected tuning values, and the main reason the game feels more engaging than the previous checkpoint.

## Stage 5 — Character, comedy, and interaction craft

**Build**

- Cohesive tech-office art, one expressive engineer, consistent item silhouettes, and all seven item variants: green CI build, shipped feature, verified agent run, coffee, production bug, hallucinated tool call, and runaway agent loop.
- Movement lean, catch pop, relieved coffee reaction, hazard flinch, rank props, and a clear golden-chair ending.
- Short sound cues, visible mute, remembered preference, and audio initialization on a user gesture.
- One prioritized dialogue channel with software/agentic engineering jokes and no immediate repetition; introduce agent variants as the player progresses without adding new category behaviors.
- Outcome-specific engineering performance reviews based on recorded play, local personal best, the CEO stand-up/meeting punchline, and a prominent Start a new sprint retry.
- Reduced-motion equivalents and readable low-reputation feedback.

**Try it**

Play with sound on, muted, and reduced motion. Watch what happens when several events occur close together. Compare the CEO, dismissal, and contract-review screens. Replay to check dialogue variety and personal-best behavior.

**Checks and exit criteria**

- Every major event has a clear, matching visual response; audio is supportive and optional.
- Promotion celebrations are brief, readable, and do not obstruct subsequent play.
- No mixed placeholder art, missing assets, unreadable labels, stacked dialogue, or stale HUD values.
- Graduate-to-engineer progression is clear, technical references land with the audience, and reward/hazard shapes remain understandable without reading every joke.
- Mute persists where storage is available; blocked storage does not prevent playing.
- Reviews make accurate claims about the run; all endings encourage an immediate retry.
- Effects remain comfortable and smooth; reduced motion preserves all necessary information.

**Handoff:** a presentation-ready candidate and an interaction checklist showing which details were observed working.

## Stage 6 — Fresh-player testing and refinement

**Run observed sessions**

Use roughly five fresh players when available, including software and agentic engineers from the hackathon audience. Give them the game without explaining the rules. Observe the first 30 seconds, continue through an ending when possible, and see whether they choose another attempt. Record confusion and behavior before asking for opinions. Check that technical jokes add recognition without making item categories hard to understand.

Use the game plan's directional targets: at least four of five starting and recognizing item categories without coaching, and at least three wanting another run. These small-sample targets guide decisions; they do not prove broad appeal.

**Fix in priority order**

1. Blocking bugs, unfair hits, and input failures.
2. Confusing goals, item types, progress, or consequences.
3. Weak movement feel, pacing, recovery, or incentive to retry.
4. Distracting feedback, unreadable jokes, and visual inconsistencies.
5. Small enhancements that directly improve a demonstrated weak point.

**Checks and exit criteria**

- Replay the scenarios affected by each fix and recheck core start/end/retry behavior.
- Verify actual ChatGPT Sites play at laptop and phone sizes, including focus, resize, audio, pause, and touch cancellation.
- Record whether players' difficulties improved after changes; distinguish observed results from team assumptions.
- No unresolved blocker prevents a fair, understandable full run. If enjoyment remains weak, repeat refinement rather than spending the remaining event time on stretch features.
- When fresh players or target devices are unavailable, record the gap and complete the available checks; do not mark those observations as passed.

**Handoff:** a refined candidate, a short playtest findings log, remaining issues ranked by impact, and a decision about release readiness.

## Stage 7 — Feature freeze and judge release

**Prepare**

- Freeze features and fix only release defects or clear usability blockers.
- Confirm the source commit, static package, saved Site version, deployed URL, and current audience agree.
- Verify the intended judge's access in a fresh session; request a change of audience only if needed and explicitly authorized.
- Check a fresh start, early promotion, hazard, demotion/recovery, all three endings, mute, pause, and retry.
- Remove development controls from the release interface and verify bundled assets and final copy.
- Rehearse a 60–90 second demonstration and capture a backup recording showing a normal run and CEO payoff.

**Exit criteria**

- The intended judging surface and access path are verified.
- No known blocker prevents starting, understanding, completing, or retrying the game.
- The demo exposes fun and attention to detail in its opening moments; a recording can show the later payoff without requiring a full live run.
- A known working release is retained and its version is recorded.
- Remaining minor issues and verification gaps are disclosed accurately.

**Handoff:** the judge-ready URL, source/version record, short demo script, and any remaining limits.

## Hackathon time budget

The event duration is not yet specified. Use these proportions as a starting allocation and the exit criteria as the actual gates:

| Stage | Share of available time |
| --- | ---: |
| 0 — Foundation and Sites | 5% |
| 1 — Movement | 8% |
| 2 — Catch and dodge | 12% |
| 3 — Complete career | 12% |
| 4 — Fairness and pacing | 13% |
| 5 — Personality and craft | 25% |
| 6 — Fresh-player refinement | 15% |
| 7 — Judge release | 10% |

Reserve the majority of time for fairness, feel, personality, and observed refinement. Keep an early hosted checkpoint; do not postpone platform discovery until the end. If a stage overruns, reduce asset variety and stretch scope while preserving the complete game and remaining playtest time.

## Reusable checkpoint record

Copy this block into the implementation log at each handoff:

```text
Stage and status:
Source commit:
Playable URL / preview:
Sites version and audience (if hosted):
What changed:
What to try (three to five actions):
Checks completed and evidence:
Measured pacing / playtest observations:
Known issues and unverified items:
Feedback to address:
Next stage:
```

Implementation status: Stages 0 and 1 are complete. The user authorized continuing without another approval gate, then requested an MVP-first pass. Stages 2 and 3 were completed together for the playable MVP, published as Sites version 4; deferred polish is tracked in [IMPROVEMENTS.md](IMPROVEMENTS.md). See [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md) for checkpoint evidence and restart notes.
