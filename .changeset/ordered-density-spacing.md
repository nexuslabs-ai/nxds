---
'@nxds/tailwind': minor
'@nxds/core': patch
'@nxds/eslint-plugin': patch
---

Density spacing now grows in order from Tight to Spacious. Steps up to 8px are the same in every density. From step 3, the density offset grows until 24px, where it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale.
