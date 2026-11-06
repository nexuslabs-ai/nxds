---
'@nxds/core': patch
---

Export the `PaletteKey` type. `AdjustContrastPalette` already referred to it, so a project that names that type no longer reaches into a private chunk.
