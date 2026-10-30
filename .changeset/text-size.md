---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/claude-design': minor
---

Add `textSize` to the appearance: `12`, `13`, `14`, `15` or `16`, the label text size in px at the Default UI scale. It makes only the text larger or smaller. Icons, spacing and corners keep their UI scale size.

- The whole type scale follows `textSize ÷ 14`, on top of the UI scale. The label text is `textSize` × the scale's label size ÷ 14, with the UI scale's own rounding: whole px text, even px line heights, and nothing under 10px. At Larger, the five sizes are 15, 17, 18, 19 and 21px.
- `textSizePx(textSize, uiScale)` returns that label size, and `TEXT_SIZE_OPTIONS` lists the sizes.
- The provider and the first-paint script set `data-text-size` on `<html>`, next to `data-ui-scale`. The default, `14`, writes no CSS.
- Code text grows with the text size too. `prefs.codeFontSize` is its size at the Default scale and text size.
- Button, ButtonGroup text, Input, Select, Toggle and the `sm` InputGroup button take a min-height in place of a fixed height, so larger text cannot overflow them. Their default heights do not change. To set a smaller height on one of them, use `min-h-*`, not `h-*`.
- The settings screen has a Text size picker. Each option shows the label size at the current UI scale, under the note "Sizes include the current UI scale.", with a preview line.
- The CLI takes `--text-size`. The Storybook toolbars and Claude Design (`data-text-size`) offer the new setting.
