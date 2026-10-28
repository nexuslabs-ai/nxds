---
'@nxds/react': patch
---

Fix `ChartContainer` axis tick text colour. Recharts 3.8 renders tick text outside `.recharts-cartesian-axis-tick`, so ticks kept the Recharts grey and proportional digits. Tick text now uses `muted-foreground` and tabular numbers.
