---
'@nxds/core': minor
---

Add `deriveColors: false`, so an app can set its own colours. `createNxdsAppearanceSnapshotFromState`, `createNxdsAppearanceSnapshotFromCookie`, `applyNxdsAppearance` and `persistNxdsAppearance` take the option. With it, the snapshot carries no theme CSS, so nothing overrides the colours your stylesheet sets. The mode, the preset attributes and the font preferences still apply, are still saved and still paint before the app loads.
