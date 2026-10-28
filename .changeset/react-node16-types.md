---
'@nxds/react': patch
---

Fix the `@nxds/react` types for TypeScript projects that use `moduleResolution: "node16"` or `"nodenext"`. Each entry's types are now one file, and `require` gets its own `.d.cts` file.
