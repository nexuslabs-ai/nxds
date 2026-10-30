---
'@nxds/tailwind': minor
'@nxds/core': patch
'@nxds/eslint-plugin': patch
---

Density spacing now grows in order from Tight to Spacious. Steps 0–2 (up to 8px) stay fixed. From step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. The `--nx-container-*` and `--nx-layout-*` role tokens also grow at every step from Tight to Spacious. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The role tokens gave Tight the Default values and Comfortable the Relaxed values. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale.
