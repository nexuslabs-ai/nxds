---
'@nxds/core': patch
'@nxds/tailwind': patch
'@nxds/react': patch
'@nxds/vue': patch
---

The `typography-*` styles set only type: font, size, weight, line height and letter spacing. They no longer set `text-wrap`, so `truncate` works on the same element. Before, a body or heading style made the text wrap where it should end in "…".

- Dialog, AlertDialog, Sheet, Drawer, EmptyState and PageHeader titles keep balanced lines with their own `text-balance`.
- Body text no longer uses `text-wrap: pretty`, which Firefox does not support.
