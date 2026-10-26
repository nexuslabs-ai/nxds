---
'@nxds/vue': patch
---

Fix the `@nxds/vue` types for TypeScript projects that use `moduleResolution: "node16"` or `"nodenext"`. The types are now one file, and `require` gets its own `index.d.cts`.
