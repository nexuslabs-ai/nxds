# @nxds/eslint-plugin

## 0.8.0

### Minor Changes

- 19e119b: Icons keep their size at every density, and follow the UI scale. Components that sized icons with spacing steps now use the `size-icon-glyph-*` utilities: 12px where `size-3` was, 14px where `size-3.5` was and 16px where `size-4` was (sizes at the Default scale). A RadioGroup dot is 6px smaller than the default icon (10px at Default), and a menu radio dot is 8px smaller (8px at Default). The InputOTP separator is a fixed 4px. Menu and Select item indicators use a wrapper the size of the default icon. Default density looks the same. In other densities, icons stop growing and shrinking. The `nx-class-conventions` lint rule now reports an icon that takes its size from a spacing step or a `--nx-spacing-*` variable. It checks `svg` selectors such as `[&_svg]:size-4`, and `Icon*` or `*Icon` elements such as `<IconX className="nx:size-4" />`. It checks story files too.
- 19e119b: Stroked icons draw a line that grows with the icon in every component, whatever their `strokeWidth`. The line is 0.5px plus the icon size ÷ 16: 1.25px at 12px, 1.5px at 16px and 2px at 24px. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio` to change the line.

  | Package                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke-base` (0.5px) and `--nx-icon-stroke-ratio` (0.0625) tokens and the `icon-stroke` utility. The utility sets `stroke-width` and `vector-effect: non-scaling-stroke` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`. The line is the base plus `--nx-icon-size` times the ratio. Each `size-icon-glyph-*` utility sets `--nx-icon-size`, and an icon without it draws the line for a default icon.                                                                                                     |
  | `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. Icons use the named `size-icon-glyph-*` sizes, so they stay the same size at every density. The Resizable grip and the chart tooltip icon are now 12px. Tabs triggers draw an icon you don't size at the default icon size. To change one part's line, set the tokens in its class, such as `nx:[--nx-icon-stroke-base:1px]`. A `stroke-*` class doesn't change the line. |
  | `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio`, so a canvas can change them.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children without `nx:icon-stroke`, or with a plain `size-*`, `h-*` or `w-*` class such as `[&_svg]:size-4`. A plain size passes when the same selector sets `--nx-icon-size`.                                                                                                                                                                                                                                                                                                              |

### Patch Changes

- 19e119b: Density spacing now grows in order from Tight to Spacious. Steps 0–2 (up to 8px) stay fixed. From step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. Each `--nx-container-*` and `--nx-layout-*` role token now has one step's value at every density: `container-p` is step 6, `container-gap` step 4, `layout-section-gap` step 8 and `layout-stack-gap` step 2. So `layout-stack-gap` stays 8px. The token files write each role as a reference, such as `{spacing.6}`, and the token catalogue lists that reference. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The role tokens gave Tight the Default values and Comfortable the Relaxed values. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale. A themed Claude Design sampler board is taller at larger text, so a page at Spacious density stays inside it.

## 0.7.0

### Minor Changes

- 7370faf: Add `@nxds/no-react-19-only`. It reports React 19-only APIs in source that has to run on React 18: `use`, actions, rendering a context as a provider, ref callbacks that return a cleanup, and document metadata. It is not in `nxdsComponentConfig`.

## 0.6.0

### Minor Changes

- a87db64: `no-render-prop-types` skips a prop whose JSDoc has a `@thirdPartyShape <reason>`
  tag. A tag without a reason doesn't count. Use it instead of an `eslint-disable` comment when a third-party API
  mandates the prop's shape, so the file still lints in apps without this plugin.

## 0.5.0

### Minor Changes

- e743cb7: Rename the config helpers from `nexus*` to `nxds*`: `nxdsComponentConfig`, `nxdsSpacingTokenConfig` and `nxdsTailwindClassesConfig`.

## 0.4.0

### Minor Changes

- 8ba43e1: Add `no-jsdoc-data-tags`, which reports `@default` and `@example` JSDoc tags.

### Patch Changes

- 1d2c04a: The npm pages now link to the docs at https://nxds.dev and to the renamed repository at https://github.com/nexuslabs-ai/nxds.

## 0.3.2

### Patch Changes

- fefb8c8: The npm pages now link to the docs at https://nexusui.so and list search
  keywords.

## 0.3.1

### Patch Changes

- bf903a4: Ship the MIT licence file (Copyright (c) 2026 Nexus Labs) with the package.

## 0.3.0

### Minor Changes

- 15c901b: Paint field boundaries and focus rings with real `border` and `outline` instead
  of generated `box-shadow`.
  - Removed `tokens/semantic/focus.json` and the `--focus-offset` root dimension
    it emitted. `outline-offset`'s initial value is already `0`, so the token was
    a no-op everywhere except `Button`, which now writes the `2px` literal.
  - Added `--outline-width-{thin,default,thick}` to the `@theme` block, mirroring
    the existing `--border-*` keys off the same borderwidth primitives. A field's
    focus ring is a `border-default` inner edge plus an `outline-default` outer
    edge, so both halves follow a `[data-borderwidth]` mode swap together.
  - Added the `transition-control` / `transition-field` utilities to
    `motion-utilities.css`. Tailwind's `transition-colors` carries
    `outline-color`, so an element painting a real ring would fade it in instead
    of landing it with the keypress; these name the properties a surface actually
    wants. The split follows the focus recipe: a control's border is its own
    decoration and may fade, while a field's border is the ring's inner half.
  - `@nexus_ds/nx-class-conventions` gained a `ringFadingTransition` check that
    fails `nx:transition-colors` sharing a scope with a ring-painting
    `focus-visible:outline-*` class. A scope is one class string, one `cva` /
    `cn` / `clsx` / `cx` call — base, array elements and `variants` values read
    together — or one `[…].join(' ')`, which collapses an array literal into a
    single attribute. That over-approximates the class attribute: sibling
    `variants` values of one key never share an element and are reported anyway,
    which is the safe direction. Only a width or a colour paints a ring, so
    `outline-none`, `outline-hidden`, `outline-0`, `outline-offset-*` and the
    `outline-solid` / `dashed` / `dotted` / `double` style keywords are exempt.

- 3ed37ed: Add the `shadow-md` tier to the emitted Tailwind theme; its primitives already
  existed in every shadow mode, so `nx:shadow-md` now renders instead of emitting
  nothing. Emit `--default-transition-duration` and
  `--default-transition-timing-function` from `--nx-motion-duration-default` and
  `--nx-motion-ease-enter`, and point `transition-control` / `transition-field` at
  them: every `nx:transition-*` utility now shares one default (200ms, enter
  easing) instead of Tailwind's 150ms, and the two ring-safe transitions are no
  longer instant without an explicit `duration-*` class.

  `@nexus_ds/eslint-plugin`: `nx-class-conventions` drops its `deadTypography`
  check. Its replacement is the new `nexusTailwindClassesConfig({ files,
entryPoint })` helper in the new `@nexus_ds/eslint-plugin/tailwind` subpath, which wires
  `eslint-plugin-better-tailwindcss`'s `no-unknown-classes` (an optional peer
  dependency, needed only for that subpath) against your stylesheet: it reports any class that emits no CSS,
  including a missing `nx:` prefix.

  `@nexus_ds/react`: NavigationMenu content now slides 1.5rem on enter and exit;
  it previously computed its offset from an undefined `--spacing` and did not
  slide. Its transform origin is now `top` (was the invalid `top-center`).

## 0.2.0

### Minor Changes

- 1d27496: Add design tokens and typography tiers, and recalibrate the `fine` stroke mode.

  **Tokens**
  - New `thin` border-width rung (0.5px hairline; 1px in the `strong` mode), emitted across every stroke mode and as the full `border-thin` / `border-{side}-thin` utility set.
  - New `xxs` (11px) typography size step.
  - New `font-heading` family primitive, defaulting to the same stack as `font-sans` so headings can be branded at runtime without changing the fallback.
  - New `muted-extralight` surface token — a perceptual surface-ladder rung sitting 40% of the way from `background` toward `muted`, derived by the engine across every tone and light/dark mode.

  **Typography composites**
  - Headings now use `font-heading`, `bold`, and tighter tracking; a new `heading-xxsmall` tier is added and `label-caps` moves to the `xxs` size with `wide` tracking.

  **Stroke recalibration**
  - The `fine` stroke mode's `default` is lowered from 1px to 0.5px so its common borders read as hairline.

  **ESLint plugin**
  - `heading-xxsmall` is added to the `nx-class-conventions` live-typography allowlist.

## 0.1.0

### Minor Changes

- c455b16: First public release under the `@nexus_ds` scope. Publishes the framework-agnostic runtime engine (`@nexus_ds/core`: appearance model, runtime theme derivation, OKLCH/APCA utilities) and the lint guardrails (`@nexus_ds/eslint-plugin`) to public npm. Copied component code binds to core's runtime contract, so this begins core's semver-stable surface.
