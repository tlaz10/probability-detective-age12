# Probability Detective

A dependency-light, client-side probability lesson for approximately age 12, built for Taskmarket task TSK-MG8KF2RH.

## Run locally

Requires Node.js 22–24.

```bash
npm install
npm test
npm run build
npm run preview
```

Open `http://127.0.0.1:4173/`. For development use `npm run dev`. To regenerate Chrome browser evidence use `npm run evidence`.

## Included activities

1. Coin Laboratory — theoretical vs experimental probability across 10, 100 and 1,000 trials, including biased coins and streak reasoning.
2. Dice Investigation — one-die and two-dice distributions with chart/table views and exact routes for sums.
3. Fair-Game Designer — exact expected-point calculations, simulation, and a fresh fairness challenge.

Progress is stored only in browser `localStorage` and can be reset in the interface. There is no login, analytics, advertising, upload, remote grading, paid API, or runtime generative AI dependency.

## Build and deployment

`npm run build` produces the independently runnable static site in `dist/`. Serve that directory with any static HTTPS host.

## Browser support

Verified with installed Google Chrome 140 at 1280×1000, 768×900 and emulated mobile 360×900. The implementation uses standard HTML/CSS/ES modules intended for current evergreen browsers.

## Known limitations

Random learner-facing trials intentionally vary. The lesson is a focused 10–15 minute activity rather than a complete probability curriculum, and age suitability can vary by learner.

See `EDUCATOR_GUIDE.md`, `TEST_REPORT.md`, `ARCHITECTURE.md`, and `SCREENSHOT_WALKTHROUGH.md`.
