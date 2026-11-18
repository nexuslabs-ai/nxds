---
'@nxds/core': minor
'@nxds/tailwind': minor
'@nxds/react': minor
'@nxds/vue': minor
---

Add the `secondary-border` and `secondary-border-active` colours, for an outlined secondary control. The engine derives them from the neutral ramp, with the shades every other family's border uses. Use them as `nx:border-secondary-border` and `nx:border-secondary-border-active`, or through the `nx:border-color-secondary` and `nx:border-color-secondary-active` aliases, which `cn()` knows.

A snapshot saved by an earlier release has no value for these colours. The snapshot version is now 12, so the next load derives the saved theme again.
