---
'@nxds/react': minor
'@nxds/vue': minor
'@nxds/eslint-plugin': minor
---

Icons keep their size at every density, and follow the UI scale. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was (sizes at the Default scale). The EmptyState icon uses `size-icon-glyph-lg` (24px at Default). A vertical Attachment icon is twice the default icon (32px at Default). Small marks use a fixed pixel size: 10px in the Chart tooltip and the Resizable grip, and 4px for the InputOTP separator. Menu and Select item indicators use a wrapper the size of the default icon. A menu radio dot is 8px smaller than that wrapper (8px at Default). Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an icon that takes its size from a spacing step or a `--nx-spacing-*` variable. It checks `svg` selectors such as `[&_svg]:size-4`, and `Icon*` or `*Icon` elements such as `<IconX className="nx:size-4" />`. It checks story files too. For a size with no glyph token, it suggests a whole multiple of the default icon in `size-icon-[…]`, such as `size-icon-[calc(var(--nx-icon-glyph-default)*2)]`. `size-icon-[…]` sets the line for that size too.
