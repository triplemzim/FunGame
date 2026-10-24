# Career Catcher Development Log

## Stage 0 Foundation and Sites

Date: 24 October 2026 (Asia/Singapore).

Stage and status: Complete. Static packaging, local interactions, deployment, public access, and hosted in-app viewing checks passed.

Source repository: `https://github.com/triplemzim/FunGame.git`, verified reachable with no advertised refs before implementation. Existing planning documents preserved.

Source branch: `codex/stage-0-foundation`.

Deployed implementation source commit: `39fab3d85e23168177519a4a3ed666734811f02e`. This commit is pushed to GitHub and the Sites-managed source branch `main`. Subsequent documentation-only checkpoints record deployment evidence without changing the packaged application.

Playable URL / preview: [Public Sites preview](https://career-catcher-fungame.tenderstoat19.chatgpt.site). The local package was verified at `http://127.0.0.1:4173/`; use the README commands to restart it when needed.

Sites project: `appgprj_6adc7aeef0c08191b984ae4517b08e4a`.

Sites version and audience: Version **2**, **public** following the user's explicit request on 24 October 2026. Access policy revision **2**. Saved version ID: `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_18d8b440830c819188ebd2d8e5d2064f`. Deployment ID: `appgdep_6adc7e96b2788191a1a5645e0c2ae9a3`. The audience change reused this deployment; application source and version did not change.

What changed: Added a responsive tech-office shell, visible Start First Day and Reset Workday actions, a stationary graduate intern, and complete static packaging. Start changes the welcome message, expression, badge, and coffee steam. Reset restores ready without reloading. The latest design documents' engineering theme is reflected in the lanyard, diploma, stickered laptop, CI dashboard, and green-build/production-bug legend. Gameplay is deferred.

What to try:

1. Open the shell and select Start First Day.
2. Select Reset Workday and repeat five times.
3. Reload from the ready and started screens.
4. Activate buttons with Tab and Enter or Space.
5. Resize from a laptop viewport to a narrow phone layout.

Checks completed and evidence:

- No applicable repository or ancestor `AGENTS.md` found at implementation start.
- GitHub source URL verified; no pre-existing remote history was advertised.
- Site identity registered once and persisted in `.openai/hosting.json`.
- Sites source workflow opened this checkout successfully; Sites-managed source remains separate from GitHub `origin`.
- Initial packaging correctly rejected the not-yet-created stylesheet rather than leaving an incomplete output directory.
- Static preparation passed: five packaged files with all local resource/module references verified. Both browser modules passed Node syntax checks.
- Local preview returned HTTP 200. Browser resource loads produced no captured warnings or errors.
- At 1280 × 800 CSS pixels, the main action was visible; document width matched the viewport. Five consecutive Start/Reset cycles left one canvas and the original two buttons, with only the correct action visible.
- Tab reached the primary action; Enter and Space activated Start/Reset. A held Enter press left the shell started instead of repeatedly alternating states. Focus moved to the newly visible action.
- Reload from ready and started restored ready. Canvas resized with the viewport and used a maximum DPR of 2.
- At 375 × 667 CSS pixels, document width was 375 and Start First Day ended approximately 547 pixels below the page top; the 44-pixel action was visible without introductory scrolling. Five consecutive Start/Reset cycles also passed after the engineering-theme revision.
- Mobile heading spacing and legend text readability were corrected during visual review and rechecked after rebuilding.
- Independent sub-agent review found no implementation or scope blocker.
- Initial access inspection confirmed the current user is the owner, with one allowed user, no other editors, and no allowed groups. The Site was initially private; the later public-audience change was explicitly requested by the user.
- The revised graduate-intern artwork was visually inspected at laptop and phone sizes. Keyboard start and reload were rechecked after the revision.
- Sites confirmed successful deployment of version 2. Saved-version provenance matches the implementation commit above, and the archive contains five static files plus the hosting manifest.
- GitHub confirmed the implementation commit on `codex/stage-0-foundation`. Its `origin` remains the user-selected GitHub repository; Sites source synchronization uses its separate managed endpoint.
- The initial private URL reached a sign-in gate in the ChatGPT in-app browser. After the authorized public-audience change, the same browser opened the hosted shell without signing in.
- Public hosted checks passed at 1280 × 800 CSS pixels: five Start/Reset cycles, one canvas throughout, visible primary action, no horizontal overflow, keyboard activation, and reload from the started state back to ready.
- Public hosted checks passed at 375 × 667 CSS pixels: Start/Reset, reload to ready, canvas resize, and no horizontal overflow. The primary action ended approximately 548 pixels below the page top and was visible without introductory scrolling.
- No browser warnings or errors were captured during hosted interactions. Anonymous HTTPS requests using curl returned HTTP 200 and the expected MIME types for the HTML, CSS, both JavaScript modules, and favicon. Python's separate HTTPS probe encountered its local certificate-store configuration; no certificate checks were disabled.
- Version 1 and source commit `e0b269229a6452a84c1d817556ce6a0455017b8a` are retained as the earlier shell checkpoint. It uses the original generic office copy; version 2 matches the updated engineering theme.

Measured pacing / playtest observations: Not applicable to this shell; no gameplay timing claims.

Known issues and unverified items: No known Stage 0 blocker. Phone checks used a resized desktop browser; real-device phone and intended judge access checks remain for the later release stages. Movement, falling objects, scoring, and career logic have not been implemented.

Feedback to address: User review of the public shell and any layout or interaction feedback before movement work.

Next stage: Stage 1 responsive movement. Not started.


## Stage 1 Responsive movement

Date: 24 October 2026 (Asia/Singapore).

Stage and status: Complete. Local model/input checks and hosted movement checks passed. Subjective control tuning and physical-device testing remain in the improvements backlog.

Deployed source commit: `a18417222516c6d0e5e09c3700a06da993e348ce`. Public Site identity and audience are preserved. Sites version **3**, saved version ID `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_cf4f5be64c148191ac09bb8f8daea04e`, deployment ID `appgdep_6adc8263197c8191927f5b180ec53f0d`. URL: https://career-catcher-fungame.tenderstoat19.chatgpt.site

What changed: Five logical lanes, a standing graduate intern carrying a laptop, visible catch zone, keyboard and pointer controls, held-input repeat, edge clamping, explicit pause/resume, focus-loss pause, and clean reset. Movement uses 110 ms transitions and 180 ms held repeat in fixed 640 × 420 world coordinates.

Checks completed and evidence:

- Eleven movement-model tests passed for timing, boundaries, reversal, competing sources, clearing input, and reset.
- Eight input-routing integration tests passed for pointer cancellation/lost capture, focus loss while held, frozen pause, clean resume/reset, one loop, and keyboard/pointer equivalence.
- Browser keyboard holds crossed the floor and stopped at x=96 and x=544; holding against the boundary did not wrap. D moved one lane.
- Pointer tap moved one lane, and a native held pointer crossed to the edge without a second step from its compatibility click. The native phone-button path preserved scroll position.
- Escape paused, Resume Work resumed explicitly, and moving focus outside the board paused without automatic resume.
- A stale screen-reader pause message discovered during browser QA was fixed and rechecked after resume.
- At 375 × 667 CSS pixels, the ready action remained visible and active direction buttons measured 50 pixels high below the character, with no horizontal overflow.
- Independent integration review found no remaining concrete blocker.
- The combined 19 model/routing tests passed before source packaging. The source was saved and deployed as public Sites version 3.
- In the hosted in-app view at 375 × 667, Start and a right-button press reached lane 4, direction controls remained 50 pixels high, and document width matched the viewport. Pause/resume and reset passed with no captured warnings or errors.

Known issues and unverified items: Physical phone touch/multi-touch cancellation and subjective control comfort still need human playtest feedback. No falling items or score have been added.

What to try: Tap and hold each direction; reverse quickly; press against edges; pause or leave focus and resume; resize and reset.

Next stage: Stage 2 catch, dodge, and retry, followed by Stage 3 complete career.

## MVP continuation after app restart

The user has authorized proceeding through subsequent stages without approval, with a newer constraint to prioritize the complete playable MVP and defer time-consuming details. Track deferred work in [IMPROVEMENTS.md](IMPROVEMENTS.md). At that restart checkpoint, no Stage 2 implementation had started; the later MVP entry below records resumed work.

Resume with a timed catch-and-dodge loop, then all eight engineering ranks, reputation gates and demotion, CEO/dismissal/contract-review endings, and clean retry. Keep essential readable feedback and fair basic spawns; defer richer art, sound, expanded jokes, detailed tuning, personal best, fresh-player sessions, and judge-release preparation until the MVP is playable.

Recommended next architecture: add `src/rules.js` and `src/simulation.js`; simulation owns phase, the existing movement model, active time, spawn/items, score, reputation, grace, and career state. Main forwards input and presents snapshots/events rather than keeping a second authoritative phase/clock. Keep current flattened movement fields in snapshots so the renderer can extend to falling objects. Use a shared `createSimulation({seed})` API with start/reset/pause/resume/press/release/clearInput/update/snapshot/drainEvents.

Important functional cases: unique collision processing; swept collision must overlap in the same time interval on both axes; hazard and coffee batch arithmetic clamps once; 1.5-second grace; truncate the final step at contract time; zero reputation resolves before promotion; at most one promotion per step; demotion resets progress and restores reputation to 45; CEO on the valid final step beats timeout. Controlled QA scenarios must stay outside the public interface.

Existing input tests use a small isolated VM/DOM harness in `scripts/test-controls.mjs` linked to the real movement module. Update the harness when main imports simulation. The renderer imports movement geometry and exposes `render(model)`. All assets are local and the static preparation script checks the complete package.

The user is restarting ChatGPT after granting screen-recording/audio permissions. Resume from the repository and the existing Site ID; obtain fresh source credentials when needed. Do not create a second Site. Source branch remains `codex/stage-0-foundation`.


## Complete playable MVP Stages 2 and 3

Date: 24 October 2026 (Asia/Singapore).

Stage and status: Complete for the MVP scope. Functional tests and public hosted checks passed; human refinement remains deferred.

The user requested an MVP-first pass with continued work and no new approval gate. Stages 2 and 3 are implemented together to reach a complete run before deferred presentation work. The progression-disabled module scenario verifies the Stage 2 Intern loop separately; the public interface uses the complete career.

What changed: Three falling categories (green build, coffee, production bug), swept catches, points and Team trust, 1.5-second damage protection, a 180-second active contract, all eight engineering ranks, gated promotions, demotion with fresh progress, three endings, accurate results, and clean retry. The existing keyboard/pointer movement, focus pause, and responsive world are retained.

Checks completed and evidence:

- Sixteen simulation checks passed for collision batches, swept overlap timing, grace, coffee, progression at 39/40 trust, overflow, demotion, all ranks, final-step priority, time truncation, pause/transitions, terminal freeze, and retry.
- Eleven movement checks and eleven UI/input-routing checks passed, including all three ending screens, stopped results time/score, and a fresh retry. Controlled scenarios exist only in module tests, not in the public UI.
- Independent review found no material gameplay or phase/clock blocker.
- Five normal seeded bot runs using ordinary press/release movement reached CEO at 122.70, 117.35, 137.75, 144.45, and 132.65 active seconds. First catch was 2.93 seconds in each. These ideal forward-looking runs establish feasibility, not human pacing or enjoyment; detailed tuning remains deferred.
- Local browser play registered real catches and hazards, a promotion and later demotion, score preserved across demotion, and a decreasing contract clock. At 105 active seconds the run had 240 lifetime points and had returned to Intern with restored trust.
- At 375 × 667, active direction controls remained 50 pixels high and below the character with no horizontal overflow. The paused contract remained at 0:43 through independent work, then resumed explicitly.
- Pause was moved into the playfield heading so a phone player can reach it without scrolling below the action.

Known issues and unverified items: Physical touch interruption and human comfort are not established by automated checks. Art uses three category icons; seven visual variants, audio, richer comedy/reactions, personal best, detailed balancing, and judge preparation remain in IMPROVEMENTS.md.

Additional browser results: A normal run reached dismissal at 148.9 active seconds with 360 points, 6 incidents, one demotion, highest rank Junior Software Engineer, and final rank Intern. The phone results screen displayed those values with a prominent usable Retry. Retry reset the visible clock to 3:00, points to zero, and trust to 100. Five subsequent Start/Reset cycles preserved one canvas and a clean ready screen. CEO and contract review were reached in controlled simulation/UI tests; natural CEO feasibility was checked by the seeded input bot.

Source checkpoint: `8aa3799b533e90c851031557e8e642719b82c50a`, pushed to GitHub `codex/stage-0-foundation` and the Sites-managed source. All 38 current functional checks passed before the source helper committed and packaged the release.

Public release: Sites version **4**. Saved version ID `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_e90c607d2e9481918e39809455b1144a`; deployment ID `appgdep_6adc8599716c8191a3bdda80d8e871d1`. Deployment succeeded at https://career-catcher-fungame.tenderstoat19.chatgpt.site. Audience remains public. Version 3 and the earlier source checkpoint are retained for rollback.

Hosted verification: The Site opened without sign-in. At 375 × 667, the direction buttons measured 50 pixels high and Pause measured 44 pixels high at the top of the playfield; no horizontal overflow was observed. A hosted normal run caught rewards and reached 90 points, then promoted to Junior Software Engineer later in that run. Keyboard movement, Pause/Resume, viewport resize, and clean reset passed. The paused clock stayed at 2:35 through resize. A 1280 × 850 viewport also rendered the full game correctly. No captured browser warnings/errors occurred. Anonymous HTTPS requests returned HTTP 200 and the correct MIME types for all eight static files.

What to try: Start First Day; catch green builds and coffee, dodge coral bugs; fill the promotion bar while retaining 40 trust; pause and resume; reach an ending and retry. All three ending/rule paths were verified in controlled tests. A normal browser dismissal and normal seeded-bot CEO outcomes were observed separately; no fresh-player enjoyment claim is made.

Next: User play of the complete MVP. Stage 4–7 refinement, sound, additional variants, broader playtesting, and release preparation remain deferred under the latest MVP-first instruction and are tracked in IMPROVEMENTS.md.


## Stage 4 Fairness and pacing

Date: 24 October 2026 (Asia/Singapore).

Stage and status: Needs fixes for player engagement. Automated baseline, path-guard implementation, post-change measurements, and hosted technical checks passed. Human comfort and perceived fairness remain playtest gaps. The player reported that the three repeating item types feel boring; automated feasibility does not establish enjoyment.

What changed: Replaced the impact-neighborhood/destination heuristic with conservative direct escape and coffee-catch checks. Independent movement clones preserve held input, repeat timers, and in-flight transitions. Shared swept collision checks the full reaction, transit, and waiting path. No scoring, movement speed, spawn-rate, fall-speed, or promotion target values changed.

Why: The old heuristic estimated a held four-lane journey as 440 ms instead of 650 ms and ignored danger during transit. No unavoidable normal-pattern counterexample was found in the baseline probe; this strengthens the placement rule without claiming that existing normal patterns were broken.

Checks and measured evidence:

- Eight new fairness/clone checks passed; 11 movement, 16 career/simulation, and 11 input/UI checks also passed (46 total).
- Twenty seeded runs for each of three moving policies all reached CEO after the change. CEO medians were 127.58, 127.17, and 126.93 active seconds. First catch stayed at 2.93 seconds.
- Every lane received hazards; the 300 ms policy observed counts 155/170/150/126/166 for lanes 1–5. No projected all-lane wall occurred in the measured set, and the placement guard separately checks a reachable path.
- Stationary play produced 11 dismissals, nine contract reviews, and zero CEO wins. It took an average 6.55 hits; it is not immune. Five of 24 stationary-policy demotions were followed by regaining the previous rank.
- All 20 controlled runs starting at 20 trust recovered to at least 40, with a median 17.88 seconds. This is explicitly controlled recovery evidence.
- Full before/after values, diagnostic limits, and repeatable commands are in BALANCE_REPORT.md. The diagnostic completed in under a second on this development machine; that is not a phone performance benchmark.

Selected tuning: Retain 110 ms lane transitions, 180 ms held repeat, existing rank targets and spawn/fall settings; placement uses a 250 ms reaction margin. Exact-geometry bot promotions are faster than the directional human targets, so those targets are not marked passed and are not used alone to justify raising difficulty.

Known limitations: Direct-path rejection is conservative, not an exhaustive planner; rejected hazard/coffee candidates may become rewards. Physical touch comfort, human pacing, and whether players can explain their hits remain unverified. Sound is now being added at the player’s request; richer presentation remains deferred.

Source checkpoint: `77dcb174b20a5224b70e0ea72d37377f7518dcfd`, pushed to GitHub `codex/stage-0-foundation` and the Sites-managed source. Public Sites version **5**, saved version ID `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_00201f29b41c819189ac6e5e3eadf43c`, deployment ID `appgdep_6adc89e95d188191ba442b99583f5213`. Deployment succeeded at https://career-catcher-fungame.tenderstoat19.chatgpt.site. Audience remains public.

Hosted verification: Ready, Start, active play, catches, and a promotion were observed. No captured browser warnings/errors occurred. The fairness change preserves the existing visible controls and rules; this version still has no sound.

Player feedback: Three repeating categories feel boring. The player suggested three missed good items causing a popup and demotion, and requested sound. Sound is the immediate change. Miss penalties, an earned Debug action, short release events, and meaningful pickups are tracked as proposals in IMPROVEMENTS.md. Misses remain harmless in the current rules; no untested automatic demotion rule was added.

Next: Deliver sound, then refine engagement using the recorded player feedback.


## Stage 5 Event sounds — partial checkpoint

Date: 24 October 2026 (Asia/Singapore).

Stage and status: In progress. Sound implementation, local checks, and public audio activation checks passed. Other Stage 5 presentation work remains deferred.

What changed: Short synthesized cues for build catches, coffee, bug hits, promotions, demotions, and the three endings. Promotion uses a rising fanfare; bug hits use a low descending tone. Major events take priority over routine catches. A visible Sound On/Off button remembers the preference. Audio starts only after a Start/Resume/unmute gesture; pause, reset, and mute stop current notes. No remote audio assets or additional dependencies are required.

Checks and evidence:

- Nine audio tests passed for lazy gesture unlock, persisted mute, immediate stop, unavailable or suspended contexts, blocked storage, cue priority, distinct event/ending variants, voice cleanup, and harmless failures.
- Eleven existing UI/input checks passed after audio integration. Alongside the unchanged 11 movement, 16 simulation, and eight fairness checks, 55 current functional checks have passed.
- Browser preview reported AudioContext running after Start. Native clicks on Sound Off and Sound On kept the phase playing, with audio state changing to muted and running respectively. A focus issue found during QA was fixed before packaging.
- Mute persisted through reload; the QA preference was restored to unmuted. No captured browser warnings/errors occurred. These are browser audio activation checks, not a claim about hardware speaker volume.

What to try: Start with Sound On, catch a build, catch a bug, and earn a promotion. Toggle Sound Off during play and reload to check the saved preference. Missing builds or coffee still has no penalty.

Source checkpoint: `bfd7217465a50ea6e15dda38215d6ab23619c6e4`, pushed to GitHub `codex/stage-0-foundation` and the Sites-managed source. Public Sites version **6**, saved version ID `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_09f6156824e08191b8897a16d49a88f3`, deployment ID `appgdep_6adc8d68abe08191ae7d4fb46468554a`. Deployment succeeded at https://career-catcher-fungame.tenderstoat19.chatgpt.site. The release archive contains 11 static files plus the hosting manifest. Audience remains public; version 5 is retained as the previous checkpoint.

Hosted verification: The existing public URL loaded the Sound On control. Start entered playing and reported audio running; no browser warnings/errors were captured. The sound controller and event routing were independently reviewed for promotion and bug-hit playback. The user’s existing local run was not reset during this verification. Screenshot evidence: career-catcher-sound.png in the task visualization folder. Refresh an already-open game to load this version, then select Start with Sound On.

## Promotion interviews — engagement checkpoint

Date: 24 October 2026 (Asia/Singapore).

Stage and status: Ready for player review; published in public version 7. This is the player's approved interaction addition to Stages 4/5. Broader enjoyment, artwork, and fresh-player checks remain open.

What changed: Every promotion, including CEO, requires a short situational Yes/No interview. There are 21 rank-specific questions, three per promotion, with mixed Yes and No answers and sarcastic feedback. The approved lunch/outage example is included. The office, input, items, spawns, damage grace, and contract freeze while answering and reading the result. A correct answer plus explicit Continue grants the promotion. An incorrect answer denies it, leaves rank/lifetime points/trust intact, and sets promotion progress one build below the target; another build offers a different question. Duplicate answers cannot change a verdict. Missed items still have no penalty.

Validation:

- All 66 current functional checks passed: 22 simulation, 16 UI/input, 11 movement, eight fairness, nine audio. New checks cover frozen unanswered/answered interviews, early/duplicate Continue, invalid/duplicate answers, penalty and different-question retry, all seven promotions, final-instant CEO/contract resolution, reset, keyboard focus, denial feedback, and final-screen double taps.
- A normal local run reached its first interview after roughly 20 active seconds with 150 points and 100 trust. Keyboard Tab/Enter answered correctly; the result remained frozen until Continue, which promoted to Junior Software Engineer.
- An isolated temporary browser fixture (outside the deployable checkout) verified denial and preserved score/rank/trust. The longest combined prompt/denial was tested at 375 × 667. The phone dialog fits the viewport with its 48-pixel Continue visible, no horizontal overflow, and no unreachable top content. The responsive override was reset.
- Native browser double-click testing found that final Continue could activate the newly revealed Retry. A short pointer guard fixes this; the same native double-click now leaves CEO victory visible. A fresh subsequent retry remains available in the integration check.
- Independent reviews covered the simulation and UI. No captured browser warnings/errors occurred during the local normal/controlled scenarios. Audio approval continues to play when promotion is granted; denial has a distinct short cue.
- The diagnostic now explicitly answers interviews correctly and labels this optimistic assumption. Existing balance tables predate interviews and remain historical, not evidence of human judgement, reading time, or enjoyment.
- Static preparation passed with 12 files and all local references verified. No controlled QA state or debug controls are included in the public package.

What to try: Fill a promotion bar, answer one question incorrectly, read the joke, and Continue. Catch another build for a different question, answer it sensibly, and Continue to the new title. Read at your own pace: the contract stays paused throughout each interview.

Source checkpoint: `f8ba27be08f4f20ab5c19fc5e72ecd34a6cb9e29`, pushed to GitHub `codex/stage-0-foundation` and the Sites-managed source. Public Sites version **7**, saved version ID `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_808c36be4db481918a8fd646f480a772`, deployment ID `appgdep_6adc90a195b08191806022e9573486c1`. Deployment succeeded at https://career-catcher-fungame.tenderstoat19.chatgpt.site. Audience remains public. Version 6 is retained as the previous checkpoint. The archive contains 12 static files plus the hosting manifest.

Hosted check: The existing public URL loads the interview-capable build and starts normally with Sound On/audio running. Local normal play and isolated browser edge cases are recorded separately above; neither uses a hidden public development control. Refresh an already-open game to load this release.

Additional hosted verification: A normal public run earned its first interview at approximately 27 active seconds with 150 points and 100 trust. The expected Yes/No question appeared before the rank changed, and the contract remained at 2:33 while the question was open. No captured browser warnings/errors occurred. The screenshot career-catcher-interview.png records the live public interview. Temporary QA tabs and owned local servers were cleaned up; the public interview tab is retained for review.
