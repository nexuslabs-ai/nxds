---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/claude-design': minor
'@nxds/eslint-plugin': minor
---

Stroked icons draw a line that grows with the icon in every component, whatever their `strokeWidth`. The line is 0.5px plus the icon size ÷ 16: 1.25px at 12px, 1.5px at 16px and 2px at 24px. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio` to change the line.

| Package                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke-base` (0.5px) and `--nx-icon-stroke-ratio` (0.0625) tokens and the `icon-stroke` utility. The utility sets `stroke-width` and `vector-effect: non-scaling-stroke` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`. The line is the base plus `--nx-icon-size` times the ratio. `size-icon-glyph-default` sets `--nx-icon-size`, and an icon without it draws the 16px line. |
| `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. A part whose icons aren't 16px, such as Badge or Kbd, sets `--nx-icon-size` beside the size. To change one part's line, set the tokens in its class, such as `nx:[--nx-icon-stroke-base:1px]`. A `stroke-*` class doesn't change the line.       |
| `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio`, so a canvas can change them.                                                                                                                                                                                                                                                                                                           |
| `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children, such as `[&_svg]:size-4`, without `nx:icon-stroke`.                                                                                                                                                                                                                                                                                                     |
