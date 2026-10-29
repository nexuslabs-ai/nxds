---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/eslint-plugin': minor
---

Icons keep a fixed size at every density. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was. Larger icons use a fixed pixel size: 24px in EmptyState and 32px in a vertical Attachment. Menu and Select item indicators use a 16px wrapper. Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an SVG selector that takes its size from a spacing step, such as `[&_svg]:size-4`.
