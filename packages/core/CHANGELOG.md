# @nxds/core

## 0.14.0

### Minor Changes

- 19e119b: Add the `--nx-icon-glyph-xs` (12px), `-sm` (14px), `-default` (16px), `-lg` (24px) and `-xl` (32px) tokens and a `size-icon-glyph-*` utility for each. A utility sets an icon's width, height and line. The tokens are the same at every density and follow the UI scale.
- 19e119b: Stroked icons draw a line that grows with the icon in every component, whatever their `strokeWidth`. The line is 0.5px plus the icon size ÷ 16: 1.25px at 12px, 1.5px at 16px and 2px at 24px. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio` to change the line.

  | Package                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke-base` (0.5px) and `--nx-icon-stroke-ratio` (0.0625) tokens and the `icon-stroke` utility. The utility sets `stroke-width` and `vector-effect: non-scaling-stroke` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`. The line is the base plus `--nx-icon-size` times the ratio. Each `size-icon-glyph-*` utility sets `--nx-icon-size`, and an icon without it draws the line for a default icon.                                                                                                     |
  | `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. Icons use the named `size-icon-glyph-*` sizes, so they stay the same size at every density. The Resizable grip and the chart tooltip icon are now 12px. Tabs triggers draw an icon you don't size at the default icon size. To change one part's line, set the tokens in its class, such as `nx:[--nx-icon-stroke-base:1px]`. A `stroke-*` class doesn't change the line. |
  | `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio`, so a canvas can change them.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children without `nx:icon-stroke`, or with a plain `size-*`, `h-*` or `w-*` class such as `[&_svg]:size-4`. A plain size passes when the same selector sets `--nx-icon-size`.                                                                                                                                                                                                                                                                                                              |

- 19e119b: Controls hold their parts at every stroke and density.
  - The Switch thumb and the Checkbox check stay inside the border at every stroke. At the strong stroke, they are smaller by the extra border width.
  - Checkbox and RadioGroup have a 24 × 24px target around the box. The Switch has a 24px-high target across its track. To give your own small control the same target, add `nx:target-24` and `nx:relative`.
  - Badge, Kbd, SidebarMenuBadge and the InputGroup `xs` button grow with their text, so the text stays inside the border at every UI scale and density.
  - In menus, the text of a check item, an inset item and an inset label starts 8px after the check at every density.
  - The NxdsAppearanceColorField hex input and the NxdsAppearanceSettings font inputs show their text in the code font.

- 19e119b: Add `textSize` to the appearance: `12`, `13`, `14`, `15` or `16`, the label text size in px at the Default UI scale. It makes only the text larger or smaller. Icons, spacing and corners keep their UI scale size.
  - The whole type scale follows `textSize ÷ 14`, on top of the UI scale. The label text is `textSize` × the scale's label size ÷ 14, with the UI scale's own rounding: whole px text, even px line heights, and nothing under 8px. At Larger, the five sizes are 15, 17, 18, 19 and 21px.
  - `TEXT_SIZE_OPTIONS` lists the sizes as `{ value, label }`, such as `{ value: 12, label: '12px' }`. `textSizePx(textSize, uiScale)` returns the label size at a UI scale.
  - The provider and the first-paint script set `data-text-size` on `<html>`, next to `data-ui-scale`. Both attributes go on the same element. The default, `14`, writes no CSS.
  - Code text grows with the text size too. `prefs.codeFontSize` is its size at the Default scale and text size.
  - The token catalogue names `textSize` as a control of the type sizes, the line heights and the code size. `createTokenCatalogue` gives those tokens at the appearance's text size.
  - Button, ButtonGroup text, Input, Select, Toggle and the `sm` InputGroup button take a min-height in place of a fixed height, so larger text cannot overflow them. Their default heights do not change.
  - **Breaking:** `cn()` now lets a later `h-*` or `size-*` remove an earlier `min-h-*`, so `className="nx:h-8"` still sets the height of those controls. `min-h-0` and `min-h-[0px]` stay, so a flex or scroll child can still shrink.
  - The settings screen has a Text size picker. Each option shows its size at the Default UI scale, under the note "The size at the Default UI scale." A preview line shows the size at the current UI scale.
  - The CLI takes `--text-size`. The Storybook toolbars offer the new setting.
  - `nxds-cli export claude-design` takes `--text-size`. A Claude Design system has no `data-text-size` attribute. A system at another text size lists its type sizes, line heights and code size at that size, and its sampler board's height fits it.

- 19e119b: Add `uiScale` to the appearance: `'small'`, `'default'`, `'large'` or `'larger'`. It makes the whole UI larger or smaller and keeps its proportions.
  - Label text is 12, 14, 16 or 18px, the default icon is 14, 16, 18 or 20px, and a default Button is 36, 40, 44 or 50px at the Default density.
  - Spacing and corners at every density and corner mode scale with it. Lengths are whole px below 16px and even px from 16px, and spacing steps stay in order.
  - Icons are even px at every scale, so an icon centers in an even box such as Kbd. The `xs` icon is 10, 12, 14 or 16px.
  - Page widths (`max-w-*` and the other named widths) and the Sidebar and Toaster widths scale with it. `--nx-ui-scale` holds the factor (0.9, 1, 1.1 or 1.25) for the few other fixed sizes. The collapsed Sidebar rail is now its button plus padding, so the buttons stay inside it and centered at every scale and density, also with `data-density` on the Sidebar. From `md` up, Sidebar props other than `className` go on its root, so the space the Sidebar keeps beside the page is as wide as the rail. The Sidebar no longer sets `--sidebar-width-icon`.
  - The provider sets `data-ui-scale` on `<html>`. Density and corners nest under it.
  - Checkbox, Radio and Switch take their size from the icon tokens, so they follow the UI scale and still ignore density. The MultiSelect option box is the Checkbox size.
  - Every named icon size follows it: `lg` is 22, 24, 28 or 30px and `xl` is 28, 32, 36 or 40px.
  - Code text grows with the label text. `prefs.codeFontSize` is the code size at the Default scale, and 12px code is 10, 14 and 15px at Small, Large and Larger. The `[data-ui-scale]` blocks in `nxds.css` set the code size too, so code scales without the provider.
  - The UI scale never shrinks text below 8px.
  - The close button of Dialog and Sheet keeps a 24px target at every scale.
  - The code size variable is `--nx-typography-code-size`, in its own `code` group. It was `--nx-typography-size-code`.
  - `prefs.uiFontSize` is gone. Use `uiScale`. The CLI flag `--font-size` is replaced by `--ui-scale`. Shuffle keeps the user's UI scale.
  - The token catalogue's `control` is now `controls`, a list. A new `scale` control names `uiScale`, which scales the token. Spacing and radius name their mode and `uiScale`, and the code size names `codeFontSize` and `uiScale`. The catalogue also lists `--nx-ui-scale` in family `ui-scale` and the page widths in family `width`.
  - The settings screen and the Storybook toolbars offer the new mode.
  - `nxds-cli export claude-design` takes `--ui-scale` in place of `--font-size`. A Claude Design system has no `data-ui-scale` attribute. A system at another scale lists every token at that scale and declares its density and corner presets at that scale in `tokens.css`. Its sampler board is wider to match, and its height fits the system's UI scale, density and stroke.
  - `createTokenCatalogue(appearance)` lists each token at the appearance's UI scale, the same values the `[data-ui-scale]` blocks in `nxds.css` hold.

### Patch Changes

- 19e119b: Density spacing now grows in order from Tight to Spacious. Steps 0–2 (up to 8px) stay fixed. From step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. Each `--nx-container-*` and `--nx-layout-*` role token now has one step's value at every density: `container-p` is step 6, `container-gap` step 4, `layout-section-gap` step 8 and `layout-stack-gap` step 2. So `layout-stack-gap` stays 8px. The token files write each role as a reference, such as `{spacing.6}`, and the token catalogue lists that reference. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The role tokens gave Tight the Default values and Comfortable the Relaxed values. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale. A themed Claude Design sampler board is taller at larger text, so a page at Spacious density stays inside it.

## 0.13.0

### Minor Changes

- c004e3a: `nxds-cli export claude-design` takes the `init` theme flags, except `--mode` and `--icons`, and exports a system in that theme: its colours, presets, type scale, code size and fonts. Curated fonts load from Google Fonts through tokens.css. The system records its theme in `design-system.json`, so an update with `--index` keeps it. Passed flags change only the parts they name, and an empty one, such as `--density=`, resets it. Default code text in the export is 12px, as in apps.

  `createTokenCatalogue` takes the appearance fields it uses: the brand colour, surface tone, contrasts, and UI and code font sizes.

  Code text reads `--nx-typography-size-code`, 12px by default. `nx:typography-code-block` and `nx:typography-code-inline` are 12px without the provider too, and the code font size pref sets the variable. `nx:font-mono` sets only the font family, so mono text takes its size from its own text style.

## 0.12.0

### Minor Changes

- b3d79a5: Add three display text styles for hero and page-section titles: `nx:typography-display-large`, `nx:typography-display-medium` and `nx:typography-display-small`.

  | Style            | Size | Line height | Weight   |
  | ---------------- | ---- | ----------- | -------- |
  | `display-large`  | 5xl  | 5xl         | semibold |
  | `display-medium` | 4xl  | 4xl         | semibold |
  | `display-small`  | 3xl  | 3xl         | semibold |

  Each style uses the heading font, `tighter` letter spacing and `text-wrap: balance`. `cn()` in `@nxds/react` and `@nxds/vue` merges them with the other `typography-*` styles.

- b3d79a5: Set up a whole theme in one step: brand color, surface tone, tokens, mode, contrast, self-hosted fonts and the icon library nxds components draw their own icons with. Phosphor is the default icon library, in place of Tabler Icons.

  | Package                    | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
  | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`               | `ICON_LIBRARY_OPTIONS`, `FONT_OPTIONS`, `shuffleNxdsAppearance` (pass `fonts` to pick from the fonts your app loads) and `shuffleNxdsIconLibrary`. `NxdsAppearancePrefs` gains `headingFont`, which sets `--nx-typography-family-font-heading`. `null`, the default, follows `uiFont`. `NXDS_THEME_FIELDS` lists each theme part as its `init` flag, and `nxdsThemeFlags` and `applyNxdsThemeFlags` turn a theme into flags and back.                                                         |
  | `@nxds/react`, `@nxds/vue` | `lib/icons` draws Phosphor. `lib/icon-libraries/` holds the same icons in Lucide, Tabler Icons, HugeIcons and Remix Icon. InputOTP's separator draws the filled circle at `nx:size-1`. `NxdsAppearanceSettings` gains a Heading font field.                                                                                                                                                                                                                                                   |
  | `nxds-cli`                 | `init` takes a flag for each theme part, such as `--brand-color`, `--density`, `--font` and `--icons`. It writes `nxds-theme.ts`, which `appearance-state.ts` spreads, and records the theme in `nxds.json`. A flag left out keeps its value, and an empty one, such as `--density=`, resets it. A new font replaces the old one's import, and `doctor` lists the old package. Running `init --icons` again switches every installed `lib/icons.ts`, and `add` and `update` keep the library. |

  To keep Tabler Icons, set `"iconLibrary": "tabler"` in `nxds.json` before you run `update`. After `update`, run `npx nxds-cli@latest init --icons tabler` instead.

  `@nxds/claude-design` ships 421 Phosphor icons, with brand logos, in place of 496 Tabler icons. A canvas names an icon as phosphoricons.com does, such as `Nxds.Icon name="magnifying-glass"`. A `-fill` name, such as `check-circle-fill`, draws the filled icon. `Nxds.Icon` takes `weight` in place of `stroke`.

## 0.11.0

### Minor Changes

- e5916e8: Add CodeBlock, a surface for code with line numbers, marked lines and a copy button.

  | Part                  | What it does                                                                                                                           |
  | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
  | `CodeBlock`           | The surface. Use `variant="flush"` inside a Card                                                                                       |
  | `CodeBlockContent`    | The scroll region. Long lines scroll sideways, and a `nx:max-h-*` class scrolls down. `language` sets the `language-*` class on `code` |
  | `CodeBlockLine`       | One line. `number` shows it in the gutter, `highlighted` and `status` mark it                                                          |
  | `CodeBlockCopyButton` | Copies the code and tells screen readers the result                                                                                    |

  CodeBlock does not highlight code. Highlight with Shiki and the `codeBlockTheme` it ships, then put each line's tokens in a `CodeBlockLine`. In server code, such as a React Server Component, import the theme from `@nxds/react/code-block-theme`.

  In `@nxds/core`, the contrast solver also reads the chart colours on `container-hover`, the surface of a highlighted line. Where a chart colour was too faint on it, the colour gets a little darker in light mode or a little lighter in dark mode.

- 9f564c1: Add diff lines to CodeBlock, and give code its own syntax colours.

  | Package                    | Change                                                                                                                                                                                                                                                                                   |
  | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/react`, `@nxds/vue` | `CodeBlockLine` takes `diff="added"` or `diff="removed"`. The line gets a green or red tint and a `+` or `−` before the code. The copy button leaves out removed lines. `codeBlockTheme` colours code with the `syntax-*` tokens.                                                        |
  | `@nxds/core`               | Add five colour tokens for code: `syntax-keyword`, `syntax-string`, `syntax-function`, `syntax-type` and `syntax-constant`. Each takes the hue of a chart series. The contrast solver keeps them legible on `container`, `container-hover`, `success-subtle` and `error-subtle`.         |
  | `@nxds/core`               | The solver reads the chart colours only on `container` and `background` again, so chart colours go back to their values before CodeBlock. It also reads the foreground and muted colours on `success-subtle` and `error-subtle`. Muted text moves by a very small amount in some themes. |

## 0.10.0

### Minor Changes

- bfd0509: Every token the Claude Design System exports is a variable the components read. Changing a token on a canvas now changes the components, including shadows and text styles. `tokens.json` drops the palette steps, alpha scales and state colours no component reads. It keeps the full spacing and radius scales and the chart series for laying out artboards, marked "For authors". The type scale is a new `typeScale` family, and each text style class reads it the way the `nx:typography-*` utilities do.

  On a Design canvas, `data-density`, `data-radius`, `data-borderwidth` and `data-shadow` work again. `tokens.css` declares its values in the `theme` layer, so these presets and the appearance provider's runtime theme override them. The system README names the files a canvas artboard loads and their order.

  Shadows are one variable per elevation step. Each `data-shadow` preset declares `--nx-shadow-sm` and its siblings directly, and `nx:shadow-*` reads them. The `--nx-shadow-*-layer-*` variables are gone. In the token catalogue, shadow styles carry a variant per elevation preset and theme, and the layer primitives are no longer tokens.

  `ToggleGroup` applies a half-step `spacing`, such as `0.5`, instead of dropping the gap. Its `spacing` takes only spacing-scale steps, typed by the new `SpacingStep` export from `@nxds/core`.

## 0.9.1

### Patch Changes

- 5daa687: Export nxds as a Claude Design System. `npx nxds-cli export claude-design` writes a folder to publish as a Design System artifact in Claude: every token in Light and Dark, every component as a live React 18 bundle, one props interface per part for the canvas controls, and a preview and README per component. The new `@nxds/claude-design` package carries the prebuilt files and releases with `@nxds/react`.

  The Toaster follows `data-theme="dark"` as well as the `.dark` class. Charts no longer log a size warning on their first render. Every runtime colour token has a usage description.

## 0.9.0

### Minor Changes

- afc7bd7: Core now applies and saves the appearance itself, so a provider for any
  framework needs only its own state and lifecycle.

  | Export                      | What it does                                                           |
  | --------------------------- | ---------------------------------------------------------------------- |
  | `applyNxdsAppearance`       | Writes the `.dark` class, mode attributes and theme styles to the page |
  | `removeNxdsAppearance`      | Undoes `applyNxdsAppearance`                                           |
  | `persistNxdsAppearance`     | Saves the appearance to localStorage and, optionally, a cookie         |
  | `readStoredNxdsAppearance`  | Reads the saved appearance, or returns a fallback                      |
  | `resolveNxdsAppearanceMode` | Resolves `'system'` to `'light'` or `'dark'`                           |
  | `prefersDarkColorScheme`    | Reads the OS colour scheme                                             |
  | `watchColorScheme`          | Calls back when the OS colour scheme changes                           |

  `NxdsResolvedAppearanceMode`, `NxdsAppearanceCookieOptions`,
  `NxdsAppearanceCookieSameSite` and `NXDS_APPEARANCE_COOKIE_MAX_AGE_SECONDS`
  move here from the React appearance provider. Import them from
  `@nxds/core`.

## 0.8.0

### Minor Changes

- e743cb7: Rename every `Nexus` export to `Nxds`. The appearance runtime's DOM and storage names change too, so a saved appearance from an earlier version resets once.

  | Before                                                                                        | After                                                               |
  | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
  | `DEFAULT_NEXUS_APPEARANCE`                                                                    | `DEFAULT_NXDS_APPEARANCE`                                           |
  | `createNexusThemeContract`, `createNexusAppearanceSnapshot` and the other `*Nexus*` functions | `createNxdsThemeContract`, `createNxdsAppearanceSnapshot` and so on |
  | `NexusAppearanceState`, `NexusDensity` and the other `Nexus*` types                           | `NxdsAppearanceState`, `NxdsDensity` and so on                      |
  | `data-nexus-appearance-*` attributes                                                          | `data-nxds-appearance-*`                                            |
  | `nexus-appearance` storage key (`DEFAULT_STORAGE_KEY`)                                        | `nxds-appearance`                                                   |
  | `nexus-appearance-state` cookie (`DEFAULT_COOKIE_KEY`)                                        | `nxds-appearance-state`                                             |

## 0.7.2

### Patch Changes

- 1d2c04a: The npm pages now link to the docs at https://nxds.dev and to the renamed repository at https://github.com/nexuslabs-ai/nxds.

## 0.7.1

### Patch Changes

- fefb8c8: The npm pages now link to the docs at https://nexusui.so and list search
  keywords.

## 0.7.0

### Minor Changes

- 8d8ecd0: The default appearance changes: `surfaceTone` is now `'zinc'` and `corners`
  is now `'subtle'`.

  | Field         | Before     | After      |
  | ------------- | ---------- | ---------- |
  | `surfaceTone` | `'stone'`  | `'zinc'`   |
  | `corners`     | `'square'` | `'subtle'` |

  To keep the old look, set `surfaceTone: 'stone'` and `corners: 'square'` in your
  appearance. Copy the regenerated `nexus.css`, `variables.css` and
  `border-color-aliases.css` so first paint matches the new defaults.

  `zinc` is retuned to a cool, slightly violet gray at hue 286:
  - Light-mode text darkens from `#18181b` to `#09090b`.
  - Light-mode chroma doubles, from `0.001` to `0.002`.
  - Dark-mode chroma triples, from `0.002` to `0.006`.
  - The dark page darkens to `#09090b`.

## 0.6.0

### Minor Changes

- e4d7013: Breaking: Nexus CSS now emits only `nx:` utilities and `--nx-*` variables, so
  it leaves the host app's own styles alone.

  | Before                                                                        | After                                                                                                                                                                      |
  | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `nexus.css` imports Tailwind with Preflight                                   | Imports Tailwind's theme and utilities only. A new app imports `tailwindcss/preflight.css` itself                                                                          |
  | Global `*` border colour, `body` colour and background                        | Removed. Components set their own border colours; put `nx:bg-background nx:text-foreground nx:typography-body-default` on `<body>`                                         |
  | 107 unprefixed `--color-*` aliases on `:root`                                 | Removed. Use `--nx-color-*`                                                                                                                                                |
  | `:root` / `:root:not(.dark)` `color-scheme`                                   | Only `.dark { color-scheme: dark }`                                                                                                                                        |
  | Provider sets `:root { font-size }`                                           | Removed. Nexus type sizes are `--nx-typography-size-*` variables                                                                                                           |
  | Provider sets `code, pre { font-size }` and always sets `html` font smoothing | The code size reaches only Nexus classes. `fontSmoothing` defaults to `false`. Smoothing, pointer cursors and reduce motion apply page-wide only when turned on            |
  | Provider and first-paint script write an inline `color-scheme` and a meta tag | Removed, along with `colorScheme` and `metaColorScheme` on `NexusFirstPaintResolution`                                                                                     |
  | `TooltipProvider` required                                                    | Optional. Each `Tooltip` works on its own and joins a `TooltipProvider` group when inside one                                                                              |
  | `toast` and `Toaster` share sonner's default toaster                          | Use the `nexus` toaster id, so a host Toaster never shows Nexus toasts. `dismiss()`, `getToasts()` and `useSonner` cover only Nexus toasts; `Toaster` no longer takes `id` |
  | Keyframes `overlay-presence-exit`, `progress-indeterminate`                   | `nx-overlay-presence-exit`, `nx-progress-indeterminate`                                                                                                                    |

  Components that render native elements now reset those elements' browser
  defaults themselves, and Dialog and AlertDialog centre without a transform.

## 0.5.1

### Patch Changes

- bf903a4: Ship the MIT licence file (Copyright (c) 2026 Nexus Labs) with the package.

## 0.5.0

### Minor Changes

- 7aa577c: Theme autofilled fields and surface-matching rings through utilities instead of
  generated component selectors.
  - Added `autofill-bg-*`, `autofill-bg-transparent` and `autofill-text-*`. A
    field pairs them with its own `bg-*` / `text-*` classes
    (`nx:bg-container nx:autofill-bg-container`) so the browser's `!important`
    autofill paint cannot override the Nexus surface or text colour.
    `autofill-bg-transparent` clips the browser surface away for controls whose
    parent owns the surface.
  - Added `surface-*`, `ring-surface` and `ring-offset-surface`. A wrapper
    declares the surface it paints (`nx:bg-container nx:surface-container`) and
    descendant rings take that colour, falling back to `background`.
  - Removed the `accent-color` base rule on native checkbox, radio, range and
    progress elements. Nexus renders none of them; style a native control with
    `nx:accent-*` on the element instead.

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

- e54ef4b: Add `BRAND_COLOR_PRESETS` and `findBrandColorPreset` to `@nexus_ds/core`, seeded from the authored palettes, and a reusable preset/custom color field in Appearance settings. Preserve saved brand colors and the existing theme derivation. Keep controls usable in narrow layouts and make native color-picker keyboard focus visible.
- 416a7a0: Add the `4xl` runtime radius step across every corner mode and the `xxs`
  typography line-height primitive.
- 5a3ea89: Map the `label.caps` typography composite to the 12px `line-height-xxs`
  primitive, retaining its existing font size, weight, and letter spacing. This
  tightens the computed line box for every `typography-label-caps` consumer.
- 716c029: Border widths now come from Tailwind's own `--border-width-*` theme namespace,
  emitted inline next to `--outline-width-*`. Every Tailwind border side —
  including the logical `border-{s,e,bs,be}-{thin,default,thick}` and
  `divide-{x,y}-*` — reads the borderwidth tokens, so the generated
  `border-{side}-*` utilities are gone. The `border-width-*` aliases gain the
  `s`, `e`, `bs`, and `be` sides.
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

- 48f0bc6: Change `NexusAppearancePrefs.reduceMotion` from `'system' | 'on' | 'off'` to a
  `boolean` that defaults to `false`. The removed `'system'` value followed the OS
  `prefers-reduced-motion` setting, which Nexus no longer reads. Any stored string
  value now sanitizes to `false`.
- a4fde03: Add a browser-safe `@nexus_ds/core/palette` entry that looks up authored palette shades (`getPaletteShade`, `getPaletteRamp`, `PRIMITIVE_PALETTE_NAMES`, `SHADES`) with the same conversion token generation uses. Resolve status, secondary, chart, and primary endpoint colors from authored palette references while preserving existing theme outputs.
- a5176e3: Breaking: rename border-active to border-focus, four normal status borders to
  `{status}-border`, and border-primary / border-primary-active to primary-border /
  primary-border-active, preserving their light/dark values and contrast
  relationships. Update runtime variables and consumer utilities together; there
  are no old-name aliases.

  | Before                  | After                   |
  | ----------------------- | ----------------------- |
  | `border-active`         | `border-focus`          |
  | `border-error`          | `error-border`          |
  | `border-information`    | `information-border`    |
  | `border-success`        | `success-border`        |
  | `border-warning`        | `warning-border`        |
  | `border-primary`        | `primary-border`        |
  | `border-primary-active` | `primary-border-active` |

  The map applies to `--nx-color-*` variables, `--color-*` theme aliases and
  utilities (`nx:border-border-error` → `nx:border-error-border`).
  `nx:border-color-active` becomes `nx:border-color-focus`; the other
  `nx:border-color-*` aliases keep their names.

  CSS snapshots advance to version 7 to invalidate obsolete names. State-only
  cookies remain version 6 and retain preferences; server-rendered consumers should
  pass the cookie-derived snapshot to the bootstrap for the saved first paint.

- 8f9cbfa: Export the surface ladder from `@nexus_ds/core/catalogue`: `SURFACE_TOKENS`, `LIGHT_SURFACE_LADDER`, `DARK_SURFACE_LADDER`, and the `ShadeAnchor` type. Each ladder maps every opaque surface token to the anchor or raw step the theme engine derives it from. The main entry adds the `SemanticColorName` type, the literal union of every `SEMANTIC_TOKEN_REGISTRY` name, which now types `SemanticTokenMeta.name`.
- 2b3f20c: Add `measureThemeContrast` to `@nexus_ds/core`. It reports the measured APCA Lc, tier floor, and pass state for every registered foreground/background pair of a derived theme in both modes, naming each token by its `--nx-color-*` CSS variable. The `Mode` and `Tier` types are now exported from the root entry.
- 48cec83: Add the browser-safe `@nexus_ds/core/catalogue` entry. `createTokenCatalogue()` describes every token family (colour, typography, spacing, radius, border width, shadow, motion, z-index, and breakpoints): each has its `--nx-*` name, aliases, values per theme mode and preset as the generated CSS declares them, and the authored source leaf. Runtime colours are derived from `DEFAULT_NEXUS_APPEARANCE` in explicit light and dark modes. `SemanticTokenMeta` no longer has a `description` field; those descriptions are now part of the catalogue.

## 0.4.0

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

## 0.3.0

### Minor Changes

- 249ef8e: Expose the full shipped density, corner, and elevation modes through the public appearance model unions, option tables, and sanitizers.
- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 958c764: Split the appearance `contrast` control into independent `lightContrast` and `darkContrast` scalars. Theme derivation applies each mode's contrast to that mode's tokens only, so the dark theme can be tuned without moving the light theme. Snapshot version bumped to 4; stale snapshots reset to `60/60` defaults (pre-production, no migration).
- 1d55de3: Add token-engine instrumentation exports for the semantic color cutover: public APCA contrast access, semantic token registry metadata, the public surface-token type, and the frozen engine matrix snapshot fixture.
- 748e08c: Adjudicate semantic color token values for the token engine by aligning runtime producers with the reviewed semantic JSON values for chart series 2, warning fills, default focus, black-brand primary states, and foreground ink tiers. Set the default dark structural contrast to `0` and refresh the reviewed engine snapshot matrix.

## 0.2.0

### Minor Changes

- 58c79bc: Primary color now derives from the brand seed's own lightness instead of a fixed mid-tone shade, so the primary button _is_ the chosen color (deep navy stays navy; black renders black in light and white in dark). Fill legibility is APCA-guarded and the dark-mode lift is continuous at the honor boundary.

  Fixed `pinnedOklch` so a fully-neutral seed (chroma 0) stays neutral instead of taking the fallback hue at full cusp chroma — this was rendering an achromatic (black/grey) brand's disabled, subtle, and border shades as pink.

  Removed the static brand menu: the twelve `brands-*.json` token files are consolidated into a single `theme-default-{light,dark}.json` (primary + secondary + border-primary), and the `--brand` build flag / `DEFAULT_CONFIG.brand` are gone. Custom brand colors are now chosen at runtime rather than from a fixed set of pre-built brand stylesheets.

## 0.1.0

### Minor Changes

- c455b16: First public release under the `@nexus_ds` scope. Publishes the framework-agnostic runtime engine (`@nexus_ds/core`: appearance model, runtime theme derivation, OKLCH/APCA utilities) and the lint guardrails (`@nexus_ds/eslint-plugin`) to public npm. Copied component code binds to core's runtime contract, so this begins core's semver-stable surface.
