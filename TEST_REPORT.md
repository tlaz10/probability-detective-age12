# Test Report — TSK-MG8KF2RH

All results below were actually run on 2026-09-09 in the submission working tree. Raw final command output is preserved in `evidence/final-verification-2026-09-09.txt`.

## Clean install / reproducibility

Command: `npm ci --ignore-scripts`
Result: **PASS** — package lock resolved successfully; 0 vulnerabilities reported.

Node runtime used: Node.js `24.16.0`. Repository requirement: Node.js 22–24.

## Automated domain/static tests

Command: `npm test`
Result: **14 passed, 0 failed**.

Coverage includes seeded reproducibility; coin count/proportion arithmetic; 0%/100% boundaries; fixed fair-coin theory after observed heads; non-forced sample results; one-die bounds; two-dice sum bounds and 36-route theory; exact expected-point fairness; simulation score consistency; final challenge fairness; required activity regions; privacy/reset/no external runtime scripts; reduced-motion CSS and visible-focus rules.

## Production build

Command: `npm run build`
Result: **PASS** — static output generated in `dist/`.

## Reproducible Chrome acceptance evidence

Command: `npm run evidence`
Browser executable verified on the same run machine: Google Chrome `152.0.7977.83`.
Harness: Chrome DevTools Protocol against an isolated headless Chrome profile.
Result: **28 passed, 0 failed**. Machine-readable results: `evidence/browser-check.json`.

Viewport coverage:
- 1280×1000 — no page-level horizontal overflow;
- 768×900 — no page-level horizontal overflow;
- 360×900 mobile emulation — no page-level horizontal overflow.

The harness also verified exact 0%/100% coin behavior; required sample sizes; chart/table count agreement; streak misconception feedback; two-dice outcomes 2–12; six ordered routes to 7; exact expected-point arithmetic; a 600-round game simulation; worked final-challenge correction; completion summary; keyboard Enter activation; reduced-motion emulation; mobile touch capability (`navigator.maxTouchPoints=1`); a 48.6px-high primary mobile touch target; delivered `touchstart` to the Run 10 button; reset without reload; and local-storage clearing.

## Normal-Chrome interactive checks

A separate interactive pass used the public HTTPS deployment in normal installed Chrome `152.0.7977.83`. Exact observations are recorded in `evidence/manual-interaction-2026-09-09.txt`.

Observed manually/interactively:
- public lesson loaded and started;
- Run 10 produced a real 10-trial result whose visible count/table values agreed;
- deliberately wrong “Less than 1/2” streak answer produced the specific correction that randomness does not owe a tail and the fair-coin probability remains 1/2;
- Reset opened the native Chrome confirmation dialog; invoking OK returned to onboarding without reloading;
- Windows UI Automation focused the semantic `2. Dice investigation` button and a real Enter keystroke activated it; the Dice Investigation became visible afterward.

Touch and reduced-motion tests were performed with Chrome emulation rather than physical touchscreen hardware. This limitation is documented rather than represented as a physical-device test.

## Public deployment

Preview: https://tlaz10.github.io/probability-detective-age12/
Independent HTTPS request on 2026-09-09: **HTTP 200**, expected `<title>Probability Detective</title>` present. Details: `evidence/deployment-check-2026-09-09.txt`.

## Concrete acceptance mapping

| Acceptance example | Evidence |
| --- | --- |
| Counts sum to requested trials and chart/table values agree | Automated count/proportion tests; Chrome checks for 1,000 coin trials and 600 two-dice rolls; interactive Run 10 observation. |
| Coin probability 0 or 1 behaves exactly as configured | Automated boundary tests plus Chrome checks `0% heads coin is exact` and `100% heads coin is exact`. |
| Fair coin theoretical chance remains 1/2 after a run/streak of heads | Automated theory test plus interactive wrong-answer correction and Chrome streak checks. |
| All die outcomes remain in the permitted range | Automated one-die and two-dice range tests; browser two-dice table contains only sums 2–12. |
| Changing sample size does not fabricate a perfectly balanced result | Seeded automated non-forced-balance test; learner-facing simulation calls use browser randomness rather than a balancing rule. |
| Final fairness explanation follows the displayed rules and probabilities | Automated expected-point/final-game tests plus Chrome worked calculation: North `6/36 × 1 = 1/6`; South `2/36 × 3 = 1/6`. |

## Screenshots / walkthrough

See `SCREENSHOT_WALKTHROUGH.md` for the numbered five-screenshot walkthrough. It includes all three required activities, a 360px mobile view, and a 768px completion view.
