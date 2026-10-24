# Career Catcher Stage 0 Implementation Plan

Status: Approved by the user on 24 October 2026. Stage 0 is **Ready for playtest**; signed-in hosted verification is pending. See [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).

Build the **Foundation and Sites** checkpoint from [DEVELOPMENT_STAGES.md](DEVELOPMENT_STAGES.md): a responsive tech-office shell with working Start First Day and Reset actions, packaged and verified in the actual ChatGPT Sites viewing experience. [GAME_PLAN.md](GAME_PLAN.md) remains the source of truth for design and future game rules.

## Current baseline

Inspected on 24 October 2026:

- The checkout contains only untracked `GAME_PLAN.md` and `DEVELOPMENT_STAGES.md`; both must be preserved.
- Local branch `main` has no commits and no Git remote is configured.
- There is no application, static package, or `.openai/hosting.json` yet.
- No applicable `AGENTS.md` was found in the checkout or its ancestor directories.
- Node.js v24.15.0 is available. The proposed static shell needs no framework or dependency installation.

Two sub-agents reviewed Stage 0 scope and acceptance checks. This approval request covers Stage 0 only, including its source checkpoint and Sites deployment. Planning does not register a Site, synchronize source, or publish anything.

## Scope and visible behavior

The current game and development-stage documents specify software and agentic engineering as the theme. The shell follows their updated first-day action and graduate-intern cues without adding gameplay.

Use buildless HTML, CSS, and JavaScript, with DOM buttons and a Canvas 2D office surface. Follow the planned navy, lavender, lime, coral, and amber palette. Use simple local shapes and a stationary CS-graduate intern with a lanyard and stickered laptop; final artwork comes later.

The ready screen contains the title, a CS-graduate/first-day cue, a one-line catch-and-dodge objective, compact reward/coffee/hazard examples, the office surface, and a prominent **Start First Day** button. Starting visibly changes the shell to a workday-started state and exposes **Reset**. Reset returns to the original ready screen without reloading. Reload also starts at ready. Do not imply that the full arcade loop is playable yet.

Use real, labeled buttons with visible focus and keyboard activation. Keep the main action visible at laptop and narrow phone sizes without requiring a scroll through introductory content. Resize the canvas for its CSS bounds and device pixel ratio. Register listeners once; state changes update the existing interface.

**Deferred:** lane movement and movement controls, falling objects, collisions, scoring, reputation, contract time, pause/resume, promotions and demotions, endings, audio, personal best, and elaborate animation. Do not add empty systems or unused modules for later stages.

## Implementation sequence

### 1. Verify and preserve source

Recheck repository instructions and working-tree changes before editing. Verify the exact `triplemzim/FunGame` repository and inspect its remote history before synchronization. Preserve the existing planning files; integrate any existing remote contents without overwriting them or force-pushing.

Keep GitHub as the user source repository and any Sites-managed source remote explicitly identified. Follow the Sites helper workflow without silently replacing either role. If source access is unavailable, continue independent local work and record the synchronization blocker.

### 2. Create the shell and static packaging

Create only the files needed for this checkpoint:

| Path | Purpose |
| --- | --- |
| `index.html` | Compact shell, objective, legend, and accessible buttons |
| `src/styles.css` | Responsive office layout, colors, and focus states |
| `src/main.js` | One-time event binding and Start/Reset wiring |
| `src/game.js` | Minimal shell state and canvas rendering |
| `scripts/prepare-static.mjs` | Generate complete `dist/` output from source |
| `README.md` | Local preview, packaging, and Stage 0 testing instructions |
| `.gitignore` | Exclude generated output and local runtime files |
| `DEVELOPMENT_LOG.md` | Checkpoint evidence and observed issues |

Run `node scripts/prepare-static.mjs` to recreate `dist/`, copying `index.html`, `src/`, and any used local assets with relative paths intact. Validate packaged references and fail clearly for missing files. Serve and test `dist/`, the same output used for hosting. Do not rely on external fonts, scripts, or asset CDNs.

### 3. Validate the integrated local preview

Open the packaged shell in a browser, exercise its lifecycle, and inspect layout, console errors, and resource loading. Resolve local failures before deploying. Keep the implementation small enough that Stage 1 can add movement without changing the packaging or shell lifecycle.

### 4. Register or reuse the Site and deploy

Reinspect `.openai/hosting.json` immediately before registration. Reuse its project identity if one exists; otherwise register once and immediately persist the returned ID with `static.directory` set to `dist`. Resolve an uncertain registration result before retrying.

Follow the installed Sites workflow for source synchronization, commit/push, archive packaging, saved version, and deployment. Use private access for a new Site; preserve the audience of an existing Site. Keep the implementation source commit, package, and saved version aligned, and retain the passing release for rollback.

### 5. Verify the actual ChatGPT viewing surface and record the handoff

Repeat Start/Reset/reload and responsive-layout checks in the actual ChatGPT Sites viewing experience. Record observed viewport behavior and current access. A successful deployment or standalone browser preview alone does not establish Sites compatibility.

Use the checkpoint template from `DEVELOPMENT_STAGES.md` in `DEVELOPMENT_LOG.md`. Record the implementation source commit, Site project/version, deployed URL, audience, checks, observed issues, unverified items, and proposed Stage 1. Update Stage 0 status only as evidence supports it. Judge access remains a Stage 7 check.

## Sub-agent work during implementation

After source setup, agree on DOM IDs, shell states, and the render interface before parallel edits:

- A presentation sub-agent owns `src/styles.css` and `src/game.js` for the responsive office surface.
- A packaging sub-agent owns `scripts/prepare-static.mjs`, `.gitignore`, and the local-use portion of `README.md`.
- The primary agent owns `index.html`, `src/main.js`, integration, source synchronization, native Sites operations, and checkpoint records.

Use an independent review after integration to check scope, reset behavior, and packaging. Keep hosting operations with the primary agent and give each writer separate file ownership.

## Acceptance checks

| Check | Passing evidence |
| --- | --- |
| Complete package | Freshly generated `dist/` contains every referenced script, style, and asset; browser loads have no missing files or application errors. |
| Start and reset | Ready → Start First Day → started → Reset → ready works for at least five consecutive cycles, with one visible interface and one response per activation. |
| Reload | Reload from ready and started produces a clean ready screen. |
| Accessible actions | Buttons work with pointer/tap and native keyboard activation; focus is visible. |
| Responsive layout | At a laptop viewport and approximately 375 × 667 CSS pixels, the office surface and main action are usable without introductory scrolling or horizontal overflow. Record actual test sizes. |
| Resize | Changing viewport size preserves a readable shell and sharp, correctly sized canvas without duplicated content. |
| Deployment | Sites confirms successful deployment; URL, source commit, saved version, project identity, and audience are recorded. |
| Actual Sites view | Start/Reset/reload and narrow-layout behavior are observed in ChatGPT's Sites viewer; any focus or viewport blocker is resolved. |
| Current access | Record who can currently open the Site without expanding its audience. |

Use package validation and focused browser checks rather than introducing a test framework for this shell. A resized desktop viewport establishes phone layout only; record real-device checks separately when available.

Stage 0 is **Complete** only when all required exit criteria pass. An unavailable actual Sites viewer, failed deployment, or platform blocker keeps the stage open, with the gap recorded. Do not label unobserved behavior as passed.

## Handoff and approval boundary

Deliver the office-shell URL and local preview instructions, source checkpoint, Sites version and audience, completed checks, known limits, and three to five actions to try. Propose Stage 1 for movement feedback; do not start it automatically.

**Approved scope:** proceed with this Stage 0 plan, including verifying and synchronizing `triplemzim/FunGame`, implementing the shell and package, saving source checkpoints, and deploying through Sites with private access for a new Site or the preserved audience for an existing Site.

The user approved implementation after reviewing this plan. Stage 1 requires a separate development iteration.
