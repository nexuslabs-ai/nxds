---
'@nxds/vue': patch
---

Fix `require('@nxds/vue')`. The CommonJS entry file ends in `.cjs`, so Node reads it as CommonJS and `require` gets every export.
