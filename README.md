# Career Catcher

A three-minute tech-office arcade game. Start as a fresh CS graduate, catch green CI builds, avoid production bugs, recover team trust with coffee, and climb through eight ranks to CEO. Losing all trust demotes you; losing it as an Intern ends the run. The contract review ends any run still active after three minutes.

Play the [public MVP](https://career-catcher-fungame.tenderstoat19.chatgpt.site). The first complete MVP includes the catch/dodge loop, promotions and demotions, all three endings, keyboard and pointer controls, pause, and immediate retry. Richer artwork, extra item variants, detailed balancing, and broader playtesting are tracked in [IMPROVEMENTS.md](IMPROVEMENTS.md).

## Build and preview

Use Node.js and Python 3; no package installation is needed.

```sh
node scripts/prepare-static.mjs
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open [the local preview](http://127.0.0.1:4173). Stop the server with Ctrl+C. After editing source files, run the packaging command again and reload the preview.

The preparation script recreates `dist/` from `index.html`, `src/`, and any local `assets/`. It checks packaged HTML resource paths, CSS URLs and imports, and JavaScript static imports. Missing files, references outside the package, external dependencies, and bare module imports fail the build. Deploy the generated `dist/` directory, which is excluded from Git.

## Play

1. Select **Start First Day**. Use Left/Right arrows or A/D; hold to repeat across five lanes. The direction buttons use the same rules.
2. Catch green checkmarks with the outlined laptop for **30 points**. Coffee restores **12 team trust**; coral bugs cost **30**. Missing items has no penalty.
3. Fill the next-promotion bar while keeping at least **40 trust**. At zero trust, lose one rank and regain 45 trust; at Intern, the run ends.
4. Press Escape or **Pause**. Choose **Resume Work** to continue. Leaving focus pauses the contract and clears held input.
5. Use **Sound On/Off** to mute or unmute short event cues. The preference is remembered when browser storage is available. Audio begins on a user gesture.
6. Reach CEO, get dismissed, or finish the 180-second contract. Review the actual run stats and select **Try Another Career**.

Resize between laptop and narrow phone widths without changing the logical game rules. Touch buttons sit below the action. Current MVP item art uses three clear categories; additional software/agent variants come later.

## Functional checks

```sh
node --experimental-vm-modules --test scripts/test-movement.mjs scripts/test-controls.mjs scripts/test-simulation.mjs scripts/test-fairness.mjs scripts/test-audio.mjs
```

Checks cover input timing/cancellation/focus, actual UI event routing and ending/retry presentation in an isolated DOM stub, and collision/career/clock rules. Simulation supports module-only initial-state scenarios for controlled QA; no development controls appear in the public interface. Browser and physical-device observations are recorded separately in the development log. The spawn guard uses independent copies of the real movement model to check reaction, transit, and waiting paths without relying on damage protection.

## Balance diagnostics

```sh
node scripts/measure-balance.mjs
node scripts/measure-balance.mjs --details --seeds=20
```

These seeded movement policies check feasibility, pacing, lane coverage, and recovery. They use exact visible-object geometry and are not human playtest results. See [the Stage 4 balance report](BALANCE_REPORT.md) for before/after results and retained tuning values.

## Project references

- [Game design and rules](GAME_PLAN.md)
- [Development stages and exit criteria](DEVELOPMENT_STAGES.md)
- [Approved Stage 0 implementation plan](STAGE_0_PLAN.md)
- [Development checkpoint evidence](DEVELOPMENT_LOG.md)

Site identity is stored in `.openai/hosting.json` after registration. Preserve that identity and the current audience when publishing later checkpoints. The deployment URL, saved Site version, source commit, current access, and observed verification results belong in the development log.
