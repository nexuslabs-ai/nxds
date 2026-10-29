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
- The provider sets `data-ui-scale` on `<html>`. Density and corners nest under it.
- Checkbox, Radio and Switch take their size from the icon tokens, so they follow the UI scale and still ignore density.
- `prefs.uiFontSize` is gone. Use `uiScale`. `prefs.codeFontSize` stays.
- The settings screen, the Storybook toolbars and Claude Design (`data-ui-scale`) offer the new mode.
