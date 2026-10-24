# Career Catcher

A responsive tech-office arcade game in development. You are a fresh Computer Science graduate starting a software engineering internship. Stage 0 provides the office shell with **Start First Day** and **Reset Workday**. Movement, falling items, scoring, career progression, sound, and the timed run arrive in later stages.

## Build and preview

Use Node.js and Python 3; no package installation is needed.

```sh
node scripts/prepare-static.mjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open [the local preview](http://127.0.0.1:4173). Stop the server with Ctrl+C. After editing source files, run the packaging command again and reload the preview.

The preparation script recreates `dist/` from `index.html`, `src/`, and any local `assets/`. It checks packaged HTML resource paths, CSS URLs and imports, and JavaScript static imports. Missing files, references outside the package, external dependencies, and bare module imports fail the build. Deploy the generated `dist/` directory, which is excluded from Git.

## Try Stage 0

1. Open the preview and select **Start First Day**. The office and message change to show that the graduate intern's first day has started.
2. Select **Reset Workday** to return to the ready screen. Repeat at least five times; each activation should produce one state change.
3. Reload from either state. The shell should start ready again.
4. Use Tab and Enter or Space to operate the buttons. Check that keyboard focus remains visible.
5. Try a laptop viewport and a narrow phone layout around 375 × 667 pixels. Check that the office and main action fit, then resize the window.

The legend introduces green CI builds to catch, coffee to restore **Team trust**, and production bugs to dodge. Team trust is the player-facing label for reputation, not a separate mechanic. These effects arrive with the arcade loop in a later stage.

This checkpoint is a tech-office shell preview; the graduate intern does not move and no items fall yet. A local preview alone does not establish ChatGPT Sites compatibility. The deployed Site must also be checked in its actual ChatGPT viewing experience.

## Project references

- [Game design and rules](GAME_PLAN.md)
- [Development stages and exit criteria](DEVELOPMENT_STAGES.md)
- [Approved Stage 0 implementation plan](STAGE_0_PLAN.md)
- [Development checkpoint evidence](DEVELOPMENT_LOG.md)

Site identity is stored in `.openai/hosting.json` after registration. Preserve that identity and the current audience when publishing later checkpoints. The deployment URL, saved Site version, source commit, current access, and observed verification results belong in the development log.
