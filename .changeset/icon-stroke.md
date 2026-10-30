---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/claude-design': minor
'@nxds/eslint-plugin': minor
---

Stroked icons draw a 1.75 line in every component, whatever their `strokeWidth`. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke` to change the line.

| Package                        | Change                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke` token (1.75) and its `icon-stroke` utility. The utility sets `stroke-width` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`.                                                                                                                 |
| `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. To change one part's line, add `nx:[--nx-icon-stroke:2]` to its class. A `stroke-*` class doesn't change the line. |
| `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke`, so a canvas can change it.                                                                                                                                                                                                                 |
| `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children, such as `[&_svg]:size-4`, without `nx:icon-stroke`.                                                                                                                                                                       |
