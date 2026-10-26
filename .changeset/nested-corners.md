---
'@nxds/core': minor
'@nxds/react': minor
'@nxds/vue': minor
---

Items close to a rounded container share its corner. Tabs triggers, menu and select items, command items, input-group buttons, slider ranges and similar parts now take the container's radius minus its border and padding, and never less than half of that radius, in whole pixels. Only the corners that touch the container's corners use the full value; the others use the half.

New utilities: a container declares its corner with `nest-outer-*`, `nest-border-*` (or `nest-border-none`) and `nest-padding-*`; its items use `rounded-nest`, `rounded-nest-corner` and `rounded-{s,e,t,b}-nest-corner`. They use CSS `round()`.
