# Architecture

Probability Detective is a static browser application with no backend, account system, remote grader, analytics, or runtime API dependency.

## File responsibilities

- `index.html` — semantic lesson shell, activity regions, controls, tables and adult-free learner navigation.
- `styles.css` — responsive layout, focus states, touch sizing, non-colour-only chart treatment, dark mode and reduced-motion rules.
- `src/content.js` — learning objectives, misconception feedback and explanatory lesson content.
- `src/model.js` — probability calculations and simulation helpers with injectable randomness.
- `src/app.js` — UI state, feedback, navigation, chart/table rendering, local persistence and reset.
- `tests/` — deterministic domain and static-contract tests.
- `scripts/build.mjs` — dependency-free static build into `dist/`.
- `scripts/browser-evidence.mjs` — isolated Chrome/CDP acceptance run, responsive checks and screenshots.

## State and persistence

The active lesson state is held in browser memory and mirrored to one `localStorage` record so refresh can preserve progress. The stored data contains only activity completion/current-view and local experiment history; it contains no learner identity. Reset removes that record and restores the onboarding state without requiring a page reload.

## Random sampling model

Learner-facing experiments use the browser's `Math.random` through model functions that accept an `rng` function. Tests inject a seeded xorshift32 generator (`seededRng`) so the same test seed reproduces the same trials.

- **Coin:** each trial compares one random value with configurable `pHeads`. Explicit branches guarantee `p=0` produces no heads and `p=1` produces all heads.
- **One die:** `floor(rng() * 6) + 1`, producing only integers 1–6.
- **Two dice:** two independent die calls are added, producing sums 2–12. The theoretical sum model uses ordered-route counts `[1,2,3,4,5,6,5,4,3,2,1] / 36`.
- **Charts/tables:** both are rendered from the same generated result object; no separate or fabricated chart dataset exists.

Changing sample size generates a fresh sample. No code forces a balanced result or edits a sample toward the theoretical value.

## Fairness model

The designer partitions a fair six-sided die between Side A and Side B, then multiplies each side's exact probability by its selected points reward. A game is labelled fair only when the two exact expected-point values are equal; a simulation is shown as evidence from one run rather than the definition of fairness.

The fresh Harbor Signals challenge uses two fair dice:
- North: sum 7, `6/36 × 1 = 1/6` expected points per round.
- South: sum 2 or 12, `2/36 × 3 = 1/6` expected points per round.

The displayed explanation therefore follows the published rules regardless of which side happens to score more in a finite simulation.

## Safety / network boundary

All core lesson content and assets are bundled. The learner page performs no network request for grading, AI, analytics, advertising, fonts, media, or account data after the static files load. Educational references remain in the adult-facing `EDUCATOR_GUIDE.md` rather than the learner flow.
