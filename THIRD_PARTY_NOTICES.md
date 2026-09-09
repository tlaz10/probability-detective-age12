# Third-Party Notices

The learner-facing application code, lesson interface, synthetic examples, and generated screenshots in this repository are original for this submission.

No third-party runtime JavaScript, analytics SDK, paid API, remote grader, external font, copied media asset, or runtime AI service is required by the learner-facing application.

## Educational references

Adult-facing educational/scientific references are listed with page titles and URLs in `EDUCATOR_GUIDE.md`. They inform subject-matter framing and are not redistributed as bundled lesson content.

## Deployment-only GitHub Actions

The optional GitHub Pages workflow references official GitHub Actions rather than bundling them into the site:
- `actions/checkout@v4`
- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

These execute only in GitHub's CI/deployment environment and are not downloaded by or exposed to the learner application. Their upstream repositories carry their own licenses (including MIT licensing for these GitHub Actions projects).
