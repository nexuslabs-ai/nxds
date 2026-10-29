---
'@nxds/core': minor
'@nxds/react': patch
'@nxds/vue': patch
---

The UI font size now sets icon sizes too. The default icon rounds to an even pixel, and the small and extra-small icons stay 2px and 4px smaller, so a 12px UI font gives 14, 12 and 10px icons, and 16px gives 18, 16 and 14px. Text sizes and line heights now round to whole pixels.

- The UI font size takes 12 to 16px (before 8 to 32px), because control heights follow density, not the font size. `UI_FONT_SIZE_RANGE` and `CODE_FONT_SIZE_RANGE` export the limits. The code font size still takes 8 to 32px.
- Menu and Select items with a check start their text 8px after the check at every density and font size, so they line up with items that have an icon.
- The Checkbox check keeps a fixed 14px, because its box is fixed.
