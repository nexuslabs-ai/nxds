---
'@nxds/react': patch
'@nxds/vue': patch
---

`Show` and `Hide` pass their parent's `gap` to children that inherit it. A toolbar group inside them keeps the toolbar's gap.
