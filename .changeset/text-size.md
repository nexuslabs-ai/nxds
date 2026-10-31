---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/claude-design': minor
---

Add `textSize` to the appearance: `12`, `13`, `14`, `15` or `16`, the label text size in px at the Default UI scale. It makes only the text larger or smaller. Icons, spacing and corners keep their UI scale size.

- The whole type scale follows `textSize ÷ 14`, on top of the UI scale. The label text is `textSize` × the scale's label size ÷ 14, with the UI scale's own rounding: whole px text, even px line heights, and nothing under 8px. At Larger, the five sizes are 15, 17, 18, 19 and 21px.
- `TEXT_SIZE_OPTIONS` lists the sizes as `{ value, label }`, such as `{ value: 12, label: '12px' }`. `textSizePx(textSize, uiScale)` returns the label size at a UI scale.
- The provider and the first-paint script set `data-text-size` on `<html>`, next to `data-ui-scale`. Both attributes go on the same element. The default, `14`, writes no CSS.
- Code text grows with the text size too. `prefs.codeFontSize` is its size at the Default scale and text size.
- The token catalogue names `textSize` as a control of the type sizes, the line heights and the code size.
- Button, ButtonGroup text, Input, Select, Toggle and the `sm` InputGroup button take a min-height in place of a fixed height, so larger text cannot overflow them. Their default heights do not change.
- **Breaking:** `cn()` now lets a later `h-*` or `size-*` remove an earlier `min-h-*`, so `className="nx:h-8"` still sets the height of those controls. `min-h-0` stays, so a flex or scroll child can still shrink.
- The settings screen has a Text size picker. Each option shows its size at the Default UI scale, under the note "The size at the Default UI scale." A preview line shows the size at the current UI scale.
- The CLI takes `--text-size`. The Storybook toolbars and Claude Design (`data-text-size`) offer the new setting.
