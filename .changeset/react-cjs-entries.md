---
'@nxds/react': patch
---

Fix `require` for `@nxds/react` and its subpaths. The CommonJS entry files end in `.cjs`, so Node and the Next.js config loader read them as CommonJS.
