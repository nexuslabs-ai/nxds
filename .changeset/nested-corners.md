---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
---

Items close to a rounded container share its corner. The corners that touch the container's corners are the container's radius minus its border and padding. The other corners are half the container's radius. No corner is less than half the radius, and all round to whole pixels.

- Tabs triggers, menu, context menu, menubar and select items, command items, multi-select and combobox lists, navigation menu links, input-group buttons, slider ranges, the checkbox in a choice row, the filter builder's option list, attachment media, floating sidebar items and Toolbar tools now follow their container. The menus, Select and Toolbar also round the first and last item of a group at an edge of the list or bar.
- New utilities: a container declares its corner with `nest-outer-*`, `nest-border-*` (or `nest-border-none`) and `nest-padding-*`. Its items use `rounded-nest`, `rounded-nest-corner` and `rounded-{s,e,t,b}-nest-corner`. When items can sit inside groups, the container marks its first and last child with `nest-edge-{t,b,s,e}`, and the items use `rounded-nest-edges`. `cn()` merges them all.
- Toolbar: the default bar declares `nest-outer-lg nest-border-default nest-padding-0.5`, and the floating bar `nest-outer-2xl nest-border-default nest-padding-2`. If you change a toolbar's border or padding, set the matching `nest-border-*` and `nest-padding-*` too.
- The utilities use CSS `round()`, which is Baseline widely available from 17 November 2026.
