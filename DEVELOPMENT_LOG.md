# Career Catcher Development Log

## Stage 0 Foundation and Sites

Date: 24 October 2026 (Asia/Singapore).

Stage and status: Ready for playtest; implementation and private deployment passed, signed-in hosted verification pending.

Source repository: `https://github.com/triplemzim/FunGame.git`, verified reachable with no advertised refs before implementation. Existing planning documents preserved.

Source branch: `codex/stage-0-foundation`.

Deployed implementation source commit: `39fab3d85e23168177519a4a3ed666734811f02e`. This commit is pushed to GitHub and the Sites-managed source branch `main`. Subsequent documentation-only checkpoints record deployment evidence without changing the packaged application.

Playable URL / preview: [Private Sites preview](https://career-catcher-fungame.tenderstoat19.chatgpt.site). The local package was verified at `http://127.0.0.1:4173/`; use the README commands to restart it when needed.

Sites project: `appgprj_6adc7aeef0c08191b984ae4517b08e4a`.

Sites version and audience: Version **2**, owner-private. Saved version ID: `appgprj_6adc7aeef0c08191b984ae4517b08e4a~appgver_18d8b440830c819188ebd2d8e5d2064f`. Deployment ID: `appgdep_6adc7e96b2788191a1a5645e0c2ae9a3`.

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
- Access inspection confirmed the current user is the owner, with one allowed user, no other editors, and no allowed groups. No audience expansion was performed.
- The revised graduate-intern artwork was visually inspected at laptop and phone sizes. Keyboard start and reload were rechecked after the revision.
- Sites confirmed successful deployment of version 2. Saved-version provenance matches the implementation commit above, and the archive contains five static files plus the hosting manifest.
- GitHub confirmed the implementation commit on `codex/stage-0-foundation`. Its `origin` remains the user-selected GitHub repository; Sites source synchronization uses its separate managed endpoint.
- The deployed URL opened in the ChatGPT in-app browser and reached the expected private-access gate. Continue with ChatGPT reached OpenAI's login screen; that browser does not yet have an authenticated owner session.
- Hosted Start/Reset/reload and viewport checks require owner sign-in and remain unverified. Deployment success does not substitute for them.
- Version 1 and source commit `e0b269229a6452a84c1d817556ce6a0455017b8a` are retained as the earlier shell checkpoint. It uses the original generic office copy; version 2 matches the updated engineering theme.

Measured pacing / playtest observations: Not applicable to this shell; no gameplay timing claims.

Known issues and unverified items: Hosted shell interaction is waiting for owner sign-in in the in-app browser. Stage 0 remains open until those checks pass. Phone checks used a resized desktop browser; real-device phone and judge access checks have not been performed.

Feedback to address: Owner sign-in and hosted shell playtest; then record any layout or interaction issues before starting movement work.

Next stage: Stage 1 responsive movement, after this checkpoint passes and its feedback is addressed.
