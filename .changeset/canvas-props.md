---
'@nxds/claude-design': minor
---

Set every prop a screen needs from a Claude Design canvas, as an attribute, with a control in the props panel.

- Each attribute takes its prop's type: a bare attribute or `"true"` is true, `"60"` is a number, `default-value="20,80"` is a list, `selected="2026-10-28"` is a date and objects are JSON. A value that doesn't fit logs one `[nxds]` warning and leaves the prop at its default.
- `index.d.ts` describes each attribute, so text props such as DialogContent `title`, lists, dates, `type` and `target` get controls. `coverage.md` lists the props a canvas doesn't need, and why.
- `Nxds.Icon name="plus"` places an icon by name, and icon props take names: Button `start-icon="plus"`. 496 Tabler icons ship, with 20 brand logos.
- `index.d.ts` no longer lists a props interface for each `Nxds.Icons` component. Place icons with `Nxds.Icon`.
- `Nxds.Toast` shows a toast in place on a static screen.
- `Nxds.BarChart`, `LineChart`, `AreaChart` and `PieChart` take their rows as JSON. Typed `Nxds.Recharts` parts compose a custom chart, with `data-key` for `dataKey`.
