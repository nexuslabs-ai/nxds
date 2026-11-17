---
'@nxds/core': minor
'@nxds/react': minor
'@nxds/vue': minor
---

Add `deriveColors` to the appearance provider. `<NxdsAppearanceProvider deriveColors={false}>` and `<NxdsAppearanceScript deriveColors={false}>` in React, and `createNxdsAppearance({ deriveColors: false })` in React and Vue, leave every color to your own CSS. The provider still switches the mode and presets, saves the choice and paints it before the app loads.

`useNxdsAppearance` returns `deriveColors`. `NxdsAppearanceSettings` and `NxdsThemeQuickControl` hide their brand color, surface tone and contrast controls when it is `false`. `NxdsAppearanceConfigPreview` takes `deriveColors`, and leaves those fields out when it is `false`.

The first-paint script paints no saved theme CSS when its default snapshot has none. A user who saved a derived theme before you turned derivation off does not see those colors on the next load. A user who saved their choices while derivation was off sees your default colors on the first load after you turn it back on.
