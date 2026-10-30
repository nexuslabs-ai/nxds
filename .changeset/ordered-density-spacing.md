---
'@nxds/tailwind': minor
'@nxds/core': patch
'@nxds/eslint-plugin': patch
---

Density spacing now grows in order from Tight to Spacious. Steps 0–2 (up to 8px) stay fixed. From step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. Each `--nx-container-*` and `--nx-layout-*` role token now has one step's value at every density: `container-p` is step 6, `container-gap` step 4, `layout-section-gap` step 8 and `layout-stack-gap` step 2. So `layout-stack-gap` stays 8px. The token files write each role as a reference, such as `{spacing.6}`, and the token catalogue lists that reference. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The role tokens gave Tight the Default values and Comfortable the Relaxed values. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale.
