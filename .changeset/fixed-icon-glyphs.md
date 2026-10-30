---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/eslint-plugin': minor
---

Icons keep their size at every density, and follow the UI scale. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was (sizes at the Default scale). The EmptyState icon is 1.5 × the default icon (24px at Default). A vertical Attachment icon stays 32px. Small marks use a fixed pixel size: 10px in the Chart tooltip and the Resizable grip, 8px for a menu radio dot and 4px for the InputOTP separator. Menu and Select item indicators use a 16px wrapper. Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an icon that takes its size from a spacing step. It checks `svg` selectors such as `[&_svg]:size-4`, and `Icon*` or `*Icon` elements such as `<IconX className="nx:size-4" />`.
