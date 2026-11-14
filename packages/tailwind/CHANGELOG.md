# @nxds/tailwind

## 0.4.0

### Minor Changes

- 19e119b: Add the `--nx-icon-glyph-xs` (12px), `-sm` (14px), `-default` (16px), `-lg` (24px) and `-xl` (32px) tokens and a `size-icon-glyph-*` utility for each. A utility sets an icon's width, height and line. The tokens are the same at every density and follow the UI scale.
- 19e119b: Stroked icons draw a line that grows with the icon in every component, whatever their `strokeWidth`. The line is 0.5px plus the icon size ÷ 16: 1.25px at 12px, 1.5px at 16px and 2px at 24px. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio` to change the line.

  | Package                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke-base` (0.5px) and `--nx-icon-stroke-ratio` (0.0625) tokens and the `icon-stroke` utility. The utility sets `stroke-width` and `vector-effect: non-scaling-stroke` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`. The line is the base plus `--nx-icon-size` times the ratio. Each `size-icon-glyph-*` utility sets `--nx-icon-size`, and an icon without it draws the line for a default icon.                                                                                                     |
  | `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. Icons use the named `size-icon-glyph-*` sizes, so they stay the same size at every density. The Resizable grip and the chart tooltip icon are now 12px. Tabs triggers draw an icon you don't size at the default icon size. To change one part's line, set the tokens in its class, such as `nx:[--nx-icon-stroke-base:1px]`. A `stroke-*` class doesn't change the line. |
  | `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio`, so a canvas can change them.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children without `nx:icon-stroke`, or with a plain `size-*`, `h-*` or `w-*` class such as `[&_svg]:size-4`. A plain size passes when the same selector sets `--nx-icon-size`.                                                                                                                                                                                                                                                                                                              |

- 19e119b: Density spacing now grows in order from Tight to Spacious. Steps 0–2 (up to 8px) stay fixed. From step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. Each `--nx-container-*` and `--nx-layout-*` role token now has one step's value at every density: `container-p` is step 6, `container-gap` step 4, `layout-section-gap` step 8 and `layout-stack-gap` step 2. So `layout-stack-gap` stays 8px. The token files write each role as a reference, such as `{spacing.6}`, and the token catalogue lists that reference. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The role tokens gave Tight the Default values and Comfortable the Relaxed values. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale. A themed Claude Design sampler board is taller at larger text, so a page at Spacious density stays inside it.
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

## 0.3.0

### Minor Changes

- c004e3a: `nxds-cli export claude-design` takes the `init` theme flags, except `--mode` and `--icons`, and exports a system in that theme: its colours, presets, type scale, code size and fonts. Curated fonts load from Google Fonts through tokens.css. The system records its theme in `design-system.json`, so an update with `--index` keeps it. Passed flags change only the parts they name, and an empty one, such as `--density=`, resets it. Default code text in the export is 12px, as in apps.

  `createTokenCatalogue` takes the appearance fields it uses: the brand colour, surface tone, contrasts, and UI and code font sizes.

  Code text reads `--nx-typography-size-code`, 12px by default. `nx:typography-code-block` and `nx:typography-code-inline` are 12px without the provider too, and the code font size pref sets the variable. `nx:font-mono` sets only the font family, so mono text takes its size from its own text style.

## 0.2.0

### Minor Changes

- b3d79a5: Add three display text styles for hero and page-section titles: `nx:typography-display-large`, `nx:typography-display-medium` and `nx:typography-display-small`.

  | Style            | Size | Line height | Weight   |
  | ---------------- | ---- | ----------- | -------- |
  | `display-large`  | 5xl  | 5xl         | semibold |
  | `display-medium` | 4xl  | 4xl         | semibold |
  | `display-small`  | 3xl  | 3xl         | semibold |

  Each style uses the heading font, `tighter` letter spacing and `text-wrap: balance`. `cn()` in `@nxds/react` and `@nxds/vue` merges them with the other `typography-*` styles.

## 0.1.0

### Minor Changes

- a4d4a57: White light canvas with calibrated surface support tiers, contrast-responsive dark nav/sidebar surfaces, regenerated Tailwind theme output, and component surface adoption for field-like controls.

  Breaking (`@nexus_ds/react`): the `Form` react-hook-form wrapper is removed and `react-hook-form` is dropped as a peer dependency. Consumers own their react-hook-form binding directly against the library-agnostic `Field` primitive.

- 410076a: Bake the token engine floor into generated Tailwind CSS semantic color fallbacks. Runtime `--nx-color-*` overrides still win, while the committed fallback literals now come from the reviewed engine matrix instead of semantic color JSON.
- 748e08c: Adjudicate semantic color token values for the token engine by aligning runtime producers with the reviewed semantic JSON values for chart series 2, warning fills, default focus, black-brand primary states, and foreground ink tiers. Set the default dark structural contrast to `0` and refresh the reviewed engine snapshot matrix.
