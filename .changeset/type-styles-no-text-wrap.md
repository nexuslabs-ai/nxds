---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
---

The `typography-*` styles set only type: font, size, weight, line height and letter spacing. They no longer set `text-wrap`, so `truncate` works on the same element. Before, a body or heading style made the text wrap where it should end in "…".

- Heading and display styles no longer balance their lines. Add `nx:text-balance` to a heading that should keep balanced lines.
- Dialog, AlertDialog, Sheet, Drawer and PageHeader titles keep balanced lines with their own `text-balance`. EmptyState keeps the balance its root sets. CardTitle and FieldLegend now wrap like other text.
- Body text no longer uses `text-wrap: pretty`, which Firefox does not support.
- `cn` keeps a `text-wrap` class such as `nx:text-balance` beside a `typography-*` style. A later `nx:truncate` removes it, so `nx:truncate` works on the titles above. A later `nx:truncate` also removes an earlier `overflow-*`, `whitespace-*` or `text-overflow` class. A later `nx:text-clip` or `nx:text-ellipsis` keeps `nx:truncate`.
