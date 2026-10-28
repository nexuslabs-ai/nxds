---
'@nxds/react': minor
---

Add BarChart, LineChart, AreaChart and PieChart, which plot rows of data without composing Recharts parts.

| Part        | What it does                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------- |
| `BarChart`  | Bars per category. `orientation="horizontal"` runs them left to right, `stacked` stacks them |
| `LineChart` | A line per series. `curve` sets how it joins points, `dots` marks each one                   |
| `AreaChart` | An area per series. `stacked` stacks them, `fill="gradient"` fades each toward the axis      |
| `PieChart`  | A slice per row, from `nameKey` and `valueKey`. `donut` cuts out the middle                  |

Give a chart its rows in `data`, the category key in `xKey` and the keys to plot in `series`. Each series takes the next chart colour and its key as a label, and `config` overrides either. Every chart has `legend`, `tooltip` and, except PieChart, `grid` and axis toggles.
