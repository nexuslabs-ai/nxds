---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/eslint-plugin': minor
---

Icons keep a fixed size at every density. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was. Larger icons use a fixed pixel size: 24px in EmptyState and 32px in a vertical Attachment. Small marks do too: 10px in the Chart tooltip and the Resizable grip, 8px for a menu radio dot and 4px for the InputOTP separator. Menu and Select item indicators use a 16px wrapper. Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an icon that takes its size from a spacing step. It checks `svg` selectors such as `[&_svg]:size-4`, and `Icon*` or `*Icon` elements such as `<IconX className="nx:size-4" />`. It checks story files too. For a size with no glyph token, it suggests a multiple of the default icon in `size-icon-[…]`, such as `size-icon-[calc(var(--nx-icon-glyph-default)*2)]`, which sets the line for that size too.
