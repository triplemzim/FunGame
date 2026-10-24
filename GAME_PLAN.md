# Career Catcher — Hackathon Game Plan

## 1. Goal and judging priorities

Build a polished, funny arcade game that a judge can understand immediately, enjoy within the first few catches, and want to retry. The player is a fresh Computer Science graduate starting their first software engineering internship. Catch shipped features, green builds, and verified agent work; dodge production incidents and agent mishaps; climb through engineering roles toward CTO and CEO. The ending reveals that the person who automated the work is now scheduling meetings about it.

The audience is software engineers and agentic engineers at a hackathon. Use recognizable development situations as the source of humor: pull requests, CI, debugging, on-call duty, agent evaluations, tool calls, and endless stand-ups. Keep the action understandable through icons and brief labels even when a player does not know the terminology.

The hackathon is judged on **how fun the game is to play** and **attention to detail**. These determine feature priority. Responsive controls, fair challenges, satisfying feedback, expressive reactions, and a memorable ending take precedence over feature count. There are no assumed official judging weights.

**Run limit:** 180 seconds of active gameplay; CEO victory or dismissal can end it earlier.  
**First action:** playing within 10 seconds of opening the game.  
**First promotion:** target 15–20 seconds into an average run.  
**Platform:** responsive static game published through ChatGPT Sites and verified in its actual ChatGPT viewing experience.  
**Source project:** the user-selected `triplemzim/FunGame` repository.

**Development sequence:** use [DEVELOPMENT_STAGES.md](DEVELOPMENT_STAGES.md) for the stage checklist, playable checkpoints, testing steps, and progress tracking. This document remains the source of truth for game rules and design.

## 2. The experience to optimize

The opening establishes “CS graduate, first day as an intern” through a diploma/lanyard and one short line: “Degree acquired. Production access pending.” Graduation is the character's backstory, not a ninth rank or a separate level. One Start First Day button begins immediately.

The judge's first 30 seconds should contain a readable green-build reward, a satisfying catch, an avoidable production bug, a character reaction, and a promotion to Junior Software Engineer. Each interaction should teach the next one without a separate tutorial.

| Moment | Intended experience | Detail that makes it work |
| --- | --- | --- |
| Open | “That's my first day in tech.” | CS graduate cue, Start First Day button, and a reward/hazard legend |
| First 5 seconds | “That feels good.” | Reachable reward, responsive movement, catch pop and sound |
| First hazard | “I should dodge that.” | Warning silhouette, readable fall time, visible escape lane |
| First promotion | “I want the next title.” | New prop, short fanfare, rank joke, updated progress |
| Later waves | “One more catch, then move.” | Tempting rewards near avoidable danger |
| End | “I can do better.” | Outcome-specific review, personal best, immediate retry |

The core loop is move, catch, dodge, advance, react, and retry. The player collects engineering impact and protects their team's trust. Comedy reinforces the player's decisions. Missing a reward is harmless, but the limited clock makes efficient catching valuable.

## 3. Scope and completion gates

The first complete build includes all eight ranks, keyboard and touch controls, rewards and hazards, reputation, promotions and demotions, three end conditions, pause, mute, local personal best, and reliable restart. Rank differences initially use a title, a small visual prop, a joke, and a difficulty adjustment.

Complete these gates in order:

1. **Playable loop:** a rough run reaches an ending and restarts with no stale objects or timers.
2. **Complete career:** all eight ranks, reputation gating, demotion, and CEO victory work.
3. **Enjoyable play:** fresh players understand the controls and item types, can dodge fairly, and want another attempt.
4. **Visible craft:** catches, hazards, transitions, sound, character reactions, and results feel cohesive.
5. **Judge ready:** the actual Sites view works on laptop and phone, access is verified, and a short demonstration is rehearsed.

Do not add accounts, leaderboards, multiplayer, inventory, or cloud saves to the hackathon MVP. Cut extra backgrounds, outfits, event systems, and additional item behaviors before cutting a complete career, mobile controls, or polish on the core interactions.

## 4. Movement and input

Use **five lanes with quick animated movement between them**. Each press moves one lane; holding repeats at a consistent interval. Keyboard and touch buttons use the same input rules.

- Left/Right arrows or A/D move; initial movement responds on the next animation frame.
- Start with a lane transition around 110 ms and a held-input repeat around 180 ms; tune for responsiveness and readable control.
- Space/Enter starts from the ready screen and retries from results. Escape pauses; M toggles sound when the game has focus.
- Touch uses two labeled buttons at least 48 CSS pixels tall, positioned below the action. Keep the character above the buttons and finger occlusion.
- Clamp at the edge lanes; no wrapping. Stop held input on pointer cancellation, focus loss, and state changes.
- Keep page scrolling available outside the controls; prevent arrow/Space scrolling only while the game owns focus.
- Defer drag controls until button play is demonstrably comfortable.

Use a generous, visible catch zone. A near miss must not secretly count as a hit. Lane changes affect the player's actual collision position throughout the movement animation.

## 5. Scoring, progression, and consequences

All numbers below are **starting values for playtesting**, not validated balance.

### Two internal counters with clear player presentation

- **Career points:** lifetime score for the run; always increases from rewards and never decreases. Show it as a secondary HUD value and on results.
- **Promotion progress:** points earned toward the next title. Show one clear “Next promotion” bar. This is the progression counter that resets after demotion.
- A reward adds its points to both counters. Coffee restores reputation and gives no points.
- A promotion requires the current rank's progress target and at least 40 reputation. Deduct that target from promotion progress and carry any surplus forward.
- If reputation is below 40, cap promotion progress at the current target while still awarding lifetime points. Show “Promotion pending — restore reputation.” This prevents stockpiled multi-rank jumps.
- Resolve at most one promotion per simulation step. Reaching CEO ends the run immediately after valid collision resolution.

### Rank ladder

| Current rank | Fresh progress needed for next rank | Next rank | Visual beat / joke |
| --- | ---: | --- | --- |
| Software Engineering Intern | 150 | Junior Software Engineer | Laptop sticker: “Your first PR has only 47 review comments.” |
| Junior Software Engineer | 220 | Software Engineer | Rubber duck: “You may now restart services with confidence.” |
| Software Engineer | 280 | Senior Software Engineer | On-call pager: “Congratulations. Production knows your number.” |
| Senior Software Engineer | 340 | Tech Lead | Architecture sketch: “Your code now ships through other people.” |
| Tech Lead | 400 | Engineering Manager | Sprint board: “Your busiest thread is now a calendar.” |
| Engineering Manager | 460 | CTO | Infrastructure dashboard: “Every outage is now a strategy question.” |
| CTO | 520 | CEO | Golden chair: “You automated the stand-up. Then scheduled a meeting about it.” |
| CEO | — | Victory | Stop gameplay and celebrate |

A run without demotions requires 2,370 promotion points. All eight ranks belong in the complete MVP; extensive rank-specific backgrounds do not. Use “Intern” as the short HUD label for Software Engineering Intern. This is a deliberately compressed startup career for arcade storytelling; agentic engineering is part of the work throughout the ladder rather than a separate promotion title.

### Reputation and demotion

- Start at 100 reputation; clamp to 0–100 after processing a collision batch.
- A hazard costs 30 reputation. Coffee restores 12. Missing anything has no penalty.
- Accept at most one hazard hit during a 1.5-second grace window; indicate protection clearly with a brief visual response. The window does not prevent collecting rewards or coffee.
- At zero reputation above Intern: demote exactly one rank, restore reputation to 45, and reset promotion progress to zero. Require fresh catches to regain the title.
- At zero reputation at Intern: end with dismissal.
- Lifetime career points stay intact after demotion; record both final rank and highest rank for results.
- No instant re-promotion after demotion. No progress or reputation changes once a run has ended.

### Three end conditions

1. **CEO:** win before the contract ends.
2. **Dismissed:** reputation reaches zero at Intern.
3. **Contract review:** the 180-second active-play clock expires before CEO. Show highest rank, final rank, and a humorous review encouraging another attempt.

Pause, focus loss, and short promotion/demotion transitions stop the active-play clock. The opening countdown and result animation do not consume contract time.

## 6. Items, patterns, and pacing

### MVP item definitions

| Item | Effect | Visual identity | Example reaction |
| --- | --- | --- | --- |
| Green CI build | +30 points | Green pipeline tile with checkmark | “All checks passed. Suspicious.” |
| Shipped feature | +35 points | Lavender release box with upward arrow | “It works on someone else's machine too.” |
| Verified agent run | +40 points | Gold evaluation checklist with checkmark | “The agent did the work. You checked the work.” |
| Coffee | +12 reputation | Amber cup | “Critical infrastructure restored.” |
| Production bug | -30 reputation | Coral bug inside warning triangle | “Works locally. Trends globally.” |
| Hallucinated tool call | -30 reputation | Red broken tool tile with stamped X | “Great confidence. Imaginary function.” |
| Runaway agent loop | -30 reputation | Warning loop with exclamation mark | “Task complete: created 900 new tasks.” |

Variants initially share category behavior; art and dialogue provide variety without multiplying systems. “Verified agent run” means an agent's result passed checks; make the distinction between successful, verified work and an unchecked agent failure visible in the icon and joke. Use a readable icon/shape in addition to color. Keep full item names in the legend; avoid text labels crowding the playfield.

These are themed arcade objects. They do not require a live coding task, actual agent execution, API integration, or a new minigame. Introduce green builds and production bugs first, then add agent-related variants as the career progresses while preserving the total category probabilities and scoring behavior.

### Spawn model and timing targets

- Initial mix: 60% point rewards, 10% coffee, 30% hazards; reward variants have equal weight.
- Begin near one spawn every 1.15 seconds, rising gradually toward one every 0.85 seconds.
- Keep roughly 2.5–3 seconds of fall time early and no less than about 1.6 seconds late, measured in the game world rather than screen pixels.
- Increase difficulty over several seconds after a promotion. Demotion returns toward the lower rank's settings smoothly.
- Rewards can tempt the player toward a nearby hazard, provided the player can escape. Catching every reward need not be possible.
- If reputation is below 40 and no coffee has appeared for 10 active seconds, use the next eligible safe spawn for coffee. This gives recovery a visible route.

A rough early scoring estimate is `(1 / 1.15) × 0.60 × 35 × catch rate`. At a 65% reward catch rate this is about 12 points per second, so a 150-point first promotion takes around 13 seconds plus initial fall time. Later speed changes, dodging, coffee, reputation gates, and demotions affect the full run. Measure real times rather than treating this estimate as a guarantee.

| Milestone | Playtest target |
| --- | --- |
| First successful catch | Within 5 seconds |
| First promotion | Around 15–20 seconds |
| Senior Software Engineer | Around 45–60 seconds |
| Skilled CEO victory | Around 120–180 seconds |
| Any run | Ends by 180 active seconds |

### Fairness rules

- Hazards may spawn in any lane, including the player's lane. Standing still must not grant immunity.
- Choose patterns using their future impact times and the player's reachable positions. Reject a pattern that leaves no reachable safe lane.
- Account for lane-change time, current movement, object width, and a reaction margin. A 1.5-second damage grace window does not make an unfair pattern acceptable.
- Place the first reward in or near the starting lane; keep the opening four seconds free of hazards. Introduce the first hazard with a clear escape route.
- Avoid long empty periods, prolonged reward droughts, and overlapping objects whose identities cannot be read.
- Keep a repeatable seed available for development reproduction of unfair patterns. Normal runs can vary.

## 7. Feedback and attention to detail

Prioritize a small set of interactions that each feel finished.

| Event | Visual / character response | Sound / interface response |
| --- | --- | --- |
| Move | Lean in movement direction; settle on arrival | Immediate button pressed state |
| Reward catch | Brief squash/pop, smile, floating points | Short positive note; HUD updates immediately |
| Coffee | Small relieved reaction and steam puff | Soft sip/chime; reputation visibly fills |
| Hazard | Flinch, warning stamp, restrained shake | Distinct low note; reputation drops visibly |
| Promotion | New prop and short celebration | Rising fanfare, rank joke, next target appears |
| Demotion | Prop removed, disappointed reaction | “Your access has been downgraded”; reset progress is clear |
| Low reputation | Concerned expression and labeled warning | No repetitive alarm that masks other feedback |
| CEO | Golden-chair reveal and brief confetti | Victory cue and final punchline |
| Retry | Immediate clean reset | Start feedback; no page refresh |

Promotion transitions should last about 0.6–0.9 seconds and demotions about 0.5 seconds, with gameplay frozen and transitions safely skippable. Show the new title prominently. Avoid seven long interruptions during a short run.

Use a single short dialogue channel; do not stack jokes or repeat the same line back-to-back. Important rank and outcome messages take priority over routine catches. A clean-catch streak can add a small visual flourish without changing scoring in the first build.

Respect reduced motion by replacing shake, flashes, and confetti with calmer feedback. Every sound has a visible equivalent. Keep sound opt-in through the initial play gesture, make mute immediately available, and respect the saved preference.

## 8. Screens and presentation

### Ready screen

Use a compact arcade cabinet layout: title, CS graduate/first-day cue, reward/hazard examples, controls, and one Start First Day button. Suggested tagline: “Ship features. Dodge outages. Become the boss.” Display the actual playfield prominently. The first action should not require scrolling through a landing page. After starting, a short “First day. Don't deploy on Friday” cue hands off to play.

### Gameplay

Make the character and falling objects dominant. Show engineering rank, next-promotion progress, reputation labeled “Team trust,” and remaining contract time clearly; career points are secondary. Keep `reputation` as the internal rules term, so this label does not create a second trust mechanic. Put pause and mute in consistent positions. On narrow screens, stack a compact HUD above the playfield and controls below it. Maintain fair fall time across aspect ratios.

### Pause and return

Pause automatically when the document becomes hidden or the game loses focus. Clear held inputs, freeze simulation/audio and clock, and require an explicit Resume action on return. Do not let a resumed tab jump the simulation forward.

### Results and replay

Show the outcome, highest and final engineering rank, lifetime points, time worked, incidents, and demotions. Generate a short engineering performance review using actual stats: production bugs caught, agent mishaps, verified agent runs, coffee reliance, a fall from a high rank, or a fast CEO finish. Track catches by item ID before using an item-specific review. Avoid claims unsupported by the run data.

Example review titles include “Production Survivor,” “Eval Enthusiast,” and “Caffeine-Driven Development,” selected only when the run supports them. The CEO payoff is: “You automated the stand-up. Then scheduled a meeting about it.” Retry can say “Start a new sprint.”

Give victory, dismissal, and contract review their own headline and joke. Make retry the strongest action and accept a new button/key press only after results are ready. A held movement/start key must not accidentally skip the ending or launch another run.

Store a local personal best with a clear comparison: highest rank first, then career points; optionally keep fastest CEO separately. Treat this as a best for that browser, not a synchronized ChatGPT profile save. Storage failure never blocks play.

### Visual identity

Use one cohesive tech-office arcade style: deep navy terminal-inspired panels, lavender, lime rewards, coral hazards, amber coffee. The starting character has a fresh-graduate lanyard and stickered laptop. Background details can include a code editor, CI status lights, a rubber duck, and an incident dashboard; keep them quieter than falling objects. Use consistent outlines, shadows, icon proportions, and corner radii. One expressive engineer with a few rank props is enough. Favor readable silhouettes and deliberate animation over asset volume.

## 9. Technical plan and game-state contract

Use buildless HTML/CSS/JavaScript with Canvas 2D for play and DOM elements for buttons, HUD, and accessible menus. Bundle all gameplay art, fonts where needed, and audio. No backend, accounts, database, or external API is required for the game rules.

Keep rules, ranks, spawn parameters, and dialogue in data modules. Keep one authoritative run-state object containing rank, highest rank, lifetime points, promotion progress, reputation, elapsed active time, items, input, grace timer, and statistics, including catches by item ID for contextual engineering reviews.

States are `ready`, `playing`, `paused`, `promotion`, `demotion`, `victory`, `dismissed`, and `contractReview`. Each state owns allowed input and updates. All endings stop simulation and spawning before showing results.

For each simulation step:

1. Advance movement and gather unique collisions from swept positions so fast items do not skip the catch zone.
2. Apply eligible hazard damage and coffee recovery, then clamp reputation. Add valid reward points.
3. Resolve zero reputation first: dismissal or one demotion. If either occurs, do not promote during that step.
4. Otherwise resolve one eligible promotion; reaching CEO wins.
5. If still playing and time has expired, enter contract review. A valid CEO catch on the final step wins; zero-reputation dismissal takes priority over promotion.
6. Remove processed/missed items, update the HUD, and queue feedback once.

Use elapsed time consistently with a fixed simulation step and a capped catch-up window. Auto-pause on focus loss instead of simulating a long absence. Scale rendering for device pixel ratio, cap excessive render resolution if necessary, and map input from CSS bounds into logical game coordinates. Use game-world fall times so mobile layouts do not become harder simply because the canvas is shorter.

Restart recreates the run state, clears objects/effects/inputs, resets clock and spawn timers, and preserves only preferences and local best. Register global event listeners once. Avoid reloading the page or creating another animation loop on each retry.

### Source and static packaging

```text
FunGame/
├── index.html
├── src/
│   ├── styles.css
│   ├── main.js
│   ├── game.js
│   ├── rules.js
│   └── content.js
├── assets/
│   ├── images/
│   └── audio/
├── scripts/
│   └── prepare-static.mjs
├── dist/                     # generated complete static site
├── .openai/hosting.json      # Site identity when registered
├── GAME_PLAN.md
└── README.md
```

A small preparation script copies `index.html`, `src/`, and `assets/` into `dist/` with unchanged relative paths. Validate that every referenced file exists in the packaged output. Treat `dist/` as generated output, so local and deployed source do not drift.

## 10. ChatGPT Sites delivery and verification

Read `.openai/hosting.json` before Site registration and reuse any existing project ID. Register a new Site only once when none exists. Preserve the ID and follow the installed Sites workflow for source synchronization, packaging, saved versions, and deployment.

Verify the user-selected GitHub remote when implementation starts; it was not configured when the original plan was written. Keep the GitHub repository and any Sites-managed source remote explicit, preserving their roles rather than silently replacing a remote.

Publish a minimal working shell early, then a complete rough game before the polish pass. For every release, the pushed source commit, packaged files, and saved Site version must match. A published Sites URL is a production deployment. Preserve the current audience unless the user requests a change.

Acceptance requires play in the **actual ChatGPT Sites viewing experience**, not only a standalone browser preview. Check keyboard focus, touch controls, canvas resize, available viewport height, audio after a user gesture, pause/resume, and repeated retries there. Until that verification passes, call the build targeted for Sites rather than claiming confirmed compatibility.

The game requires no additional account. Site access is a separate hosting setting: a private Site may require authorized access. Before the hackathon, verify the intended judge's access in a fresh session. Use an explicitly approved public audience if unrestricted judging access is needed.

This document update does not register, implement, or publish a Site.

## 11. Playtest and acceptance plan

Use short observed sessions with roughly five fresh players when available, including software and agentic engineers from the intended hackathon audience. Ask them to play before explaining the rules. Record confusion, first-catch time, first-promotion time, accidental hits, ending, and whether they voluntarily retry. Note whether the technical jokes land without interrupting play, and whether item categories remain clear without specialist knowledge. These are directional observations from a small sample, not statistical validation.

Target at least four of five players starting without coaching and identifying rewards/hazards correctly. Aim for at least three wanting another attempt. If they understand the game but do not enjoy it, improve movement, patterns, feedback, and pacing before adding content.

### Fun checks

- The first catch feels responsive and satisfying; the first 30 seconds contain meaningful action.
- A player can explain a hit and name a way they could have avoided it.
- Rewards create decisions about movement without unavoidable damage.
- Progress is visible, the next title is tempting, and demotion permits a credible recovery.
- CEO is achievable with practice within the contract; adjust tuning when real runs miss the targets.
- Retry is immediate enough to encourage another attempt.

### Craft and reliability checks

- All eight ranks and all three endings work; a demotion cannot trigger immediate re-promotion.
- Simultaneous reward/hazard/coffee catches and final-step outcomes follow the documented order.
- No stale items, duplicate loops, skipped endings, or accidental held-key retries after repeated restarts.
- Pause, focus loss, touch cancellation, and resize preserve a fair game state.
- HUD values, animation, sound, and dialogue agree with the actual event.
- Controls, text, and objects remain readable on laptop and phone; reduced motion and mute work.
- Local storage failure is harmless; saving is correctly described as local to the browser.
- Packaged assets and the actual Sites view work in a fresh session with the intended judge access.

## 12. Hackathon execution and feature freeze

The actual event duration is not yet specified. Use the detailed stages in [DEVELOPMENT_STAGES.md](DEVELOPMENT_STAGES.md) as the working sequence and its time proportions for allocation. The table below illustrates the broader work phases for a 24-hour event; it does not add a separate set of stages:

| Time | Focus | Gate / deliverable |
| --- | --- | --- |
| 0–1h | Foundation | Shell, controls direction, final rule constants |
| 1–6h | Complete rough game | All ranks, collisions, reputation, three endings, restart |
| Early / by 2h | Hosting checkpoint | Minimal deployed shell and access path verified |
| 6–8h | First full hosted run | Complete playable version in the actual Sites view |
| 8–15h | Gameplay feel and identity | Responsive controls, fair patterns, reactions, sound, satire |
| 15–20h | Observed play and refinement | Fix confusion, tune pacing, improve phone play and details |
| 20–22h | Feature freeze and release | Resolve defects, verify endings/access, save stable version |
| 22–24h | Demonstration | Rehearse short pitch and capture a backup recording |

Protect a substantial portion of the event for feel, feedback, observed play, and bug fixes. If behind schedule, cut additional assets and stretch features. Keep all eight ranks using inexpensive props and dialogue. Never trade a reliable ending or responsive input for more content.

Prepare a 60–90 second judge demonstration showing an actual reward, hazard, reaction, and promotion. Make the normal opening entertaining enough to demonstrate these honestly; use a backup recording to show a later CEO ending if time is limited. Do not make the judge wait through the whole run to understand the payoff.

## 13. Stretch backlog, in order

Only after the acceptance gates pass:

1. More contextual performance reviews and rank dialogue.
2. Small environmental changes and richer character reactions.
3. One telegraphed engineering event, such as a Friday deployment rush, with preserved escape routes.
4. Cosmetic unlocks that do not affect scoring.
5. Online features only if time remains and a clear judging benefit justifies their cost.

The hackathon finish line is a judge who starts immediately, notices the care in each interaction, and chooses to play again.
