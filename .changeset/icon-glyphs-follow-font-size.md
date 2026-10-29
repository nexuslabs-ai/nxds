---
'@nxds/core': minor
'@nxds/react': patch
'@nxds/vue': patch
---

The UI font size now sets icon sizes too. The default icon rounds to an even pixel, and the small and extra-small icons stay 2px and 4px smaller, so a 10px UI font gives 12, 10 and 8px icons, and 16px gives 18, 16 and 14px. Text sizes and line heights now round to whole pixels. Control heights still follow density, not the font size. The Checkbox check keeps a fixed 14px, because its box is fixed.
