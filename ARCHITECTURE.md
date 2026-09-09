# Architecture

Probability Detective is a static browser application with no backend.

- `index.html` — semantic lesson shell and activity regions.
- `styles.css` — responsive layout, focus states, touch sizing, reduced-motion rules.
- `src/content.js` — learning objectives and explanatory content.
- `src/model.js` — probability calculations and simulation helpers.
- `src/app.js` — UI state, feedback, navigation, persistence and reset.
- `tests/` — deterministic model and static-contract tests.
- `scripts/build.mjs` — static build into `dist/`.
- `scripts/browser-evidence.mjs` — Chrome/CDP interaction and responsive evidence checks.

Theoretical calculations remain separate from simulated observations. Two-dice sums use exact ordered-route counts out of 36. Game fairness compares exact expected points before simulation. Feedback is local and rule-based.

Progress is mirrored to local browser storage and reset from the interface. There is no backend, account, analytics, advertisement, payment, remote grader, external paid API, or runtime AI dependency.
