---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/eslint-plugin': minor
---

Icons keep their size at every density, and follow the UI scale. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was (sizes at the Default scale). The EmptyState icon is 1.5 × the default icon (24px at Default). A vertical Attachment icon stays 32px. Menu and Select item indicators use a 16px wrapper. Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an SVG selector that takes its size from a spacing step, such as `[&_svg]:size-4`.
