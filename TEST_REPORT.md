# Test Report — TSK-MG8KF2RH

## Automated domain/static tests
Command run on 2026-09-09: `npm test`

Result: **14 passed, 0 failed**.

Coverage includes seeded reproducibility; coin count/proportion arithmetic; 0%/100% boundaries; fair-coin theoretical probability remaining fixed; non-forced sample results; one-die bounds; two-dice sum bounds and 36-route theory; exact expected-point fairness; simulation score consistency; final challenge fairness; required activity regions; privacy/reset/no external runtime scripts; and reduced-motion/focus rules.

## Build
Command: `npm run build`

Result: **PASS**. Static output generated in `dist/`.

## Browser evidence
Command run on 2026-09-09: `npm run evidence`

Environment: installed Google Chrome 140.0.7339.208 via Chrome DevTools Protocol.

Result: **28 passed, 0 failed**. Machine-readable evidence is `evidence/browser-check.json`.

Observed checks include 1280px, 768px and 360px layouts without core horizontal overflow; exact 0% and 100% coin behavior; 10/100/1,000 sample runs; consistent counts/tables; streak misconception feedback; two-dice outcomes 2–12 with counts summing to 600 and exactly six routes to seven; exact expected-point arithmetic; 600-round game simulation; worked incorrect-answer feedback; correct final fairness reasoning; completion summary; keyboard Enter navigation; reduced-motion behavior; emulated touch input; >=44px mobile primary target; reset without reload; and local-storage clearing.

## Acceptance mapping
- Counts sum to requested trials and chart/table agree: automated model checks + browser checks 6–10.
- Probability 0 or 1 exact: browser checks 4–5 and automated boundary tests.
- Fair coin theoretical chance remains 1/2 after streak: automated theory test + browser feedback checks 11–12.
- Die outcomes remain permitted: automated die-range tests + browser two-dice check 13.
- Sample-size changes do not fabricate perfect balance: automated non-forced sample test + browser check 9.
- Final fairness explanation follows displayed rules/probabilities: expected-point automated tests + browser checks 15–18.

## Screenshots
See `SCREENSHOT_WALKTHROUGH.md`. No result above is invented; the recorded commands were run in this working tree on 2026-09-09.
