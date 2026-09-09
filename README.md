# Probability Detective

A dependency-light, client-side probability lesson for approximately age 12, built for Taskmarket task `TSK-MG8KF2RH`.

**Public HTTPS preview:** https://tlaz10.github.io/probability-detective-age12/

## Exact local commands

Requires Node.js 22–24. The repository has no runtime package dependencies.

```bash
npm ci
npm run dev
```

Development serves the editable source at `http://127.0.0.1:4173/`.

```bash
npm test
npm run build
npm run preview
```

`npm run build` writes the static production copy to `dist/`; `npm run preview` serves that directory at `http://127.0.0.1:4173/`.

To reproduce the Chrome acceptance evidence and screenshots:

```bash
npm run evidence
```

## Included activities

1. **Coin Laboratory** — theoretical vs. experimental probability across 10, 100 and 1,000 trials, including fair/biased coins, a controllable heads probability, prediction, sample-size comparison and streak reasoning.
2. **Dice Investigation** — one-die and two-dice distributions with generated chart/table views and exact ordered routes for sums.
3. **Fair-Game Designer** — selectable point rules, exact expected-point calculations, simulation, and a fresh two-dice final fairness challenge.

Progress is stored only in browser `localStorage` and can be reset in the interface. There is no login, analytics, advertising, upload, remote grading, paid API, runtime generative AI, or child-data collection.

## Deployment

GitHub Pages deployment is defined in `.github/workflows/pages.yml`. Pushing `main` triggers the free static deployment:

```bash
git push origin main
```

The live deployment was independently checked over HTTPS on 2026-09-09 and returned HTTP 200 with the expected page title. See `evidence/deployment-check-2026-09-09.txt`.

The source remains independently runnable if GitHub Pages disappears: clone/unzip it, run `npm ci`, `npm run build`, and serve `dist/` with any static server.

## Browser and viewport verification

Final verification on 2026-09-09 used installed Google Chrome `152.0.7977.83`.

The reproducible evidence harness covered:
- `1280x1000` desktop;
- `768x900` tablet-width;
- `360x900` mobile-width with touch emulation.

A separate normal-Chrome interactive pass verified visible feedback, native reset confirmation, and keyboard Enter activation. See `TEST_REPORT.md` and `evidence/`.

The implementation uses standard semantic HTML, CSS and ES modules intended for current evergreen browsers.

## Known limitations

- Learner-facing random trials intentionally vary; exact experimental counts are not reproducible unless injected/seeded randomness is used in tests.
- Physical touchscreen hardware was not used for the final evidence pass; touch behavior was tested using Chrome mobile/touch emulation with `navigator.maxTouchPoints=1` and a delivered `touchstart` event.
- The lesson is a focused 10–15 minute activity rather than a complete probability curriculum, and suitability varies by learner.
- No learning-gain, diagnostic, or universal age-suitability claim is made.

See `EDUCATOR_GUIDE.md`, `TEST_REPORT.md`, `ARCHITECTURE.md`, `SCREENSHOT_WALKTHROUGH.md`, and `SUBMISSION.md`.
