# Career Catcher

A responsive tech-office arcade game in development. You are a fresh Computer Science graduate starting a software engineering internship. Stage 1 provides a five-lane movement playground in the office shell with **Start First Day** and **Reset Workday**. Falling items, scoring, career progression, sound, and the timed run arrive in later stages.

## Build and preview

Use Node.js and Python 3; no package installation is needed.

```sh
node scripts/prepare-static.mjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open [the local preview](http://127.0.0.1:4173). Stop the server with Ctrl+C. After editing source files, run the packaging command again and reload the preview.

The preparation script recreates `dist/` from `index.html`, `src/`, and any local `assets/`. It checks packaged HTML resource paths, CSS URLs and imports, and JavaScript static imports. Missing files, references outside the package, external dependencies, and bare module imports fail the build. Deploy the generated `dist/` directory, which is excluded from Git.

## Try Stage 1

1. Select **Start First Day**. Use Left/Right arrows or A/D to move one lane; hold to repeat across five lanes.
2. Use the left/right buttons beneath the intern. They use the same movement rules and clamp at both edges.
3. Press Escape or select **Pause**. Choose **Resume Work** to continue. Switching focus away pauses automatically and clears held input.
4. Resize between laptop and narrow phone widths; the position and catch zone stay valid. The phone buttons are at least 48 CSS pixels tall.
5. Select **Reset Workday** and start again. Reload returns to ready.

The outlined laptop is the visible catch zone. This checkpoint contains movement only; no items fall yet. The published preview is [available here](https://career-catcher-fungame.tenderstoat19.chatgpt.site).

## Movement checks

```sh
node --test scripts/test-movement.mjs
node --experimental-vm-modules --test scripts/test-controls.mjs
```

The first suite tests lane timing, holds, boundaries, and reversals. The second runs actual input listeners with an isolated DOM/renderer stub to test cancellation, focus loss, pause, reset, and keyboard/pointer equivalence. Browser and physical-device checks are recorded separately in the development log.

## Project references

- [Game design and rules](GAME_PLAN.md)
- [Development stages and exit criteria](DEVELOPMENT_STAGES.md)
- [Approved Stage 0 implementation plan](STAGE_0_PLAN.md)
- [Development checkpoint evidence](DEVELOPMENT_LOG.md)

Site identity is stored in `.openai/hosting.json` after registration. Preserve that identity and the current audience when publishing later checkpoints. The deployment URL, saved Site version, source commit, current access, and observed verification results belong in the development log.
