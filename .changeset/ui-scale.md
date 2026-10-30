---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/claude-design': minor
---

Add `uiScale` to the appearance: `'small'`, `'default'`, `'large'` or `'larger'`. It makes the whole UI larger or smaller and keeps its proportions.

- Label text is 12, 14, 16 or 18px, the default icon is 14, 16, 18 or 20px, and a default Button is 36, 40, 44 or 50px at the Default density.
- Spacing and corners at every density and corner mode scale with it. Lengths are whole px below 16px and even px from 16px, and spacing steps stay in order.
- Page widths (`max-w-*` and the other named widths) and the Sidebar widths scale with it. `--nx-ui-scale` holds the factor (0.9, 1, 1.1 or 1.25) for the few other fixed sizes. The collapsed Sidebar rail is now its button plus padding, so the buttons stay inside it and centered at every scale and density.
- The provider sets `data-ui-scale` on `<html>`. Density and corners nest under it.
- Checkbox, Radio and Switch take their size from the icon tokens, so they follow the UI scale and still ignore density.
- Code text grows with the label text: `prefs.codeFontSize` is the code size at the Default scale (12px code is 10, 14 and 15px at Small, Large and Larger).
- No text is smaller than 10px at any scale.
- The close button of Dialog and Sheet keeps a 24px target at every scale.
- `prefs.uiFontSize` is gone. Use `uiScale`. The CLI flag `--font-size` is replaced by `--ui-scale`. Shuffle keeps the user's UI scale.
- The settings screen, the Storybook toolbars and Claude Design (`data-ui-scale`) offer the new mode.
