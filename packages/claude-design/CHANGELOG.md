# @nxds/claude-design

## 0.17.0

### Minor Changes

- 19e119b: Stroked icons draw a line that grows with the icon in every component, whatever their `strokeWidth`. The line is 0.5px plus the icon size ÷ 16: 1.25px at 12px, 1.5px at 16px and 2px at 24px. Lucide, Tabler Icons and HugeIcons draw strokes. Phosphor and Remix Icon draw filled shapes, so they keep their own line. Set `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio` to change the line.

  | Package                        | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
  | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `@nxds/core`, `@nxds/tailwind` | Add the `--nx-icon-stroke-base` (0.5px) and `--nx-icon-stroke-ratio` (0.0625) tokens and the `icon-stroke` utility. The utility sets `stroke-width` and `vector-effect: non-scaling-stroke` on an `<svg>` it sits on or contains, and on every shape inside that `<svg>`. The line is the base plus `--nx-icon-size` times the ratio. Each `size-icon-glyph-*` utility sets `--nx-icon-size`, and an icon without it draws the line for a default icon.                                                                                                     |
  | `@nxds/react`, `@nxds/vue`     | Every part that draws an icon has `nx:icon-stroke`, such as Button, Toggle, menu items, Select, InputGroup addons, Badge, Alert, Tabs triggers, Sidebar menu buttons and Spinner. Icons use the named `size-icon-glyph-*` sizes, so they stay the same size at every density. The Resizable grip and the chart tooltip icon are now 12px. Tabs triggers draw an icon you don't size at the default icon size. To change one part's line, set the tokens in its class, such as `nx:[--nx-icon-stroke-base:1px]`. A `stroke-*` class doesn't change the line. |
  | `@nxds/claude-design`          | `tokens.json` and `tokens.css` export `--nx-icon-stroke-base` and `--nx-icon-stroke-ratio`, so a canvas can change them.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
  | `@nxds/eslint-plugin`          | `nx-class-conventions` reports a class list that sizes its `svg` children without `nx:icon-stroke`, or with a plain `size-*`, `h-*` or `w-*` class such as `[&_svg]:size-4`. A plain size passes when the same selector sets `--nx-icon-size`.                                                                                                                                                                                                                                                                                                              |

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

- 19e119b: `tokens.json` and `tokens.css` export the `icon` family, so a canvas can change `--nx-icon-glyph-default`.
- 19e119b: Density spacing now grows in order from Tight to Spacious. Steps 0–2 (up to 8px) stay fixed. From step 2.5 the offset grows until step 6 (24px). There it is −4, −2, 0, +2, +4 and +6px from Tight to Spacious. Larger steps keep that offset. Each `--nx-container-*` and `--nx-layout-*` role token now has one step's value at every density: `container-p` is step 6, `container-gap` step 4, `layout-section-gap` step 8 and `layout-stack-gap` step 2. So `layout-stack-gap` stays 8px. The token files write each role as a reference, such as `{spacing.6}`, and the token catalogue lists that reference. Default does not change, but every other density does, so check layouts that use a non-default density. Before, Tight was larger than Default at some steps, and Comfortable and Spacious matched Default. The role tokens gave Tight the Default values and Comfortable the Relaxed values. The token catalogue and the `canonical-spacing-steps` lint rule follow the new scale. A themed Claude Design sampler board is taller at larger text, so a page at Spacious density stays inside it.

## 0.16.0

### Minor Changes

- 8e13859: `components/bundle.js` drops from 2,433,281 to 1,635,661 bytes. A canvas takes in a script under 2 MB as soon as the system updates. Over 2 MB, the new components showed only after a reload. The build fails past 1,800,000 bytes.

  The bundle keeps only Phosphor's regular and fill weights. `Nxds.Icon` loses its `weight` prop. Use a `-fill` name, such as `check-circle-fill`, for a filled icon. A canvas that still sets `weight` draws the regular icon and logs a warning, so remove the attribute.

  Data charts list their legend items in `series` order, and PieChart's legend follows its rows. Recharts sorted them alphabetically.

  README.md tells Claude to give every artboard a `mode` tweak of light and dark, and to bind the root's and each overlay content part's `data-theme` to it. A function prop takes a handler from the artboard's script, such as `on-value-change="{{setFilters}}"`.

  The sampler fits its board at the theme's text size. SETUP.md's `canvas.json` entry is 1525px tall at the default. It grows 50px for each px of text above the default, and shrinks 33px for each px below. Its chart fills its card, Today's toggles sit in its content, and the deals table fits without a sideways scroll up to 20px text.

  AspectRatio, Carousel, Combobox, FilterBuilder, FilterCondition, Resizable, ScrollArea, Sonner and Table READMEs show a full canvas example. Each used to show a bare part that rendered nothing, or a note. FilterBuilder shows a JSON mockup and a version bound to the artboard's script state. A static FilterBuilder no longer throws when clicked.

## 0.15.1

### Patch Changes

- 3cd037e: Components read their content on a Design canvas the way they do in an app.
  - An `as-child` Button slots its one element, so `<a>` inside it renders as a link styled as a button, not a button around a link.
  - AvatarGroup's `max` counts avatars, not the indentation between them.
  - Searching a MultiSelect, Combobox or Command list filters its items by their text, and no longer throws.
  - The FilterBuilder and Sidebar READMEs say what each needs, in place of an example that throws.

## 0.15.0

### Minor Changes

- cbbd852: The props panel now shows every icon prop as a dropdown with a search box. The canvas icon set goes from 422 to 381 names, under the panel's 400-option limit, and the build fails if it grows past 400.

  These icon names are gone. A canvas that uses one logs an `[nxds] … isn't an icon name` warning and draws nothing:
  - Logos: `amazon-logo`, `discord-logo`, `facebook-logo`, `figma-logo`, `gitlab-logo`, `instagram-logo`, `linkedin-logo`, `notion-logo`, `open-ai-logo`, `paypal-logo`, `slack-logo`, `stripe-logo`, `webhooks-logo`, `whatsapp-logo`, `windows-logo`, `x-logo`, `youtube-logo`. `apple-logo`, `github-logo` and `google-logo` stay.
  - `-simple` versions, with the icon to use instead: `bell-simple-ringing` (`bell-ringing`), `bookmark-simple` (`bookmark`), `copy-simple` (`copy`), `envelope-simple` (`envelope`), `funnel-simple` (`funnel`), `shopping-cart-simple` (`shopping-cart`), `stack-simple` (`stack`), `tag-simple` (`tag`), `trash-simple` (`trash`).
  - Near-duplicates, with the icon to use instead: `calendar-dot` (`calendar-dots`), `chat-centered` (`chat`), `gear-fine` and `gear-six` (`gear`), `pencil-circle` and `pencil-simple-line` (`pencil-simple`), `question-mark` (`question`), `share-fat` (`share`), `sidebar` (`sidebar-simple`), `sun-dim` (`sun`), `image-square` (`image`), `arrows-vertical` (`arrows-down-up`), `paper-plane-right` (`paper-plane-tilt`), `warning-diamond` (`warning`), `frame-corners` (`corners-out`).

  The Recharts parts list their SVG props in the panel: `fill`, `fillOpacity`, `stroke`, `strokeWidth`, `strokeDasharray` and `opacity`, wherever the part draws them. Every series, grid and reference part gains the ones it lacked. `strokeDasharray` is a string everywhere, so `stroke-dasharray="4 4"` works on Line and ReferenceLine.

## 0.14.0

### Minor Changes

- c004e3a: `nxds-cli export claude-design` takes the `init` theme flags, except `--mode` and `--icons`, and exports a system in that theme: its colours, presets, type scale, code size and fonts. Curated fonts load from Google Fonts through tokens.css. The system records its theme in `design-system.json`, so an update with `--index` keeps it. Passed flags change only the parts they name, and an empty one, such as `--density=`, resets it. Default code text in the export is 12px, as in apps.

  `createTokenCatalogue` takes the appearance fields it uses: the brand colour, surface tone, contrasts, and UI and code font sizes.

  Code text reads `--nx-typography-size-code`, 12px by default. `nx:typography-code-block` and `nx:typography-code-inline` are 12px without the provider too, and the code font size pref sets the variable. `nx:font-mono` sets only the font family, so mono text takes its size from its own text style.

## 0.13.3

### Patch Changes

- 458bfd7: `SETUP.md` now puts the sampler at `project/nxds-sampler.dc.html`, where a canvas shows it. Its `canvas.json` entry in `boards` is keyed by the file name, with `x`, `y`, `w` and `h`, and the file name goes in `order`. Step 2 and the troubleshooting table name the installed system at `project/ds/nxds/`.

## 0.13.2

### Patch Changes

- 822919d: The sampler is now a sales dashboard shipped as `nxds-sampler.dc.html` beside `SETUP.md`, so it shows as an artboard on a Claude Design canvas. Claude puts the file on the canvas unchanged and adds its `canvas.json` entry. Switch its `mode` tweak to `dark` to check the dark theme. `Label`, `ChoiceRow` and `ChoiceCard` now list `htmlFor`, so a canvas can link a label to its control. A release's `files.json` now lists the files beside `project/` with their hashes too, and `nxds-cli` copies only what it lists. When a release drops a root file you edited, `nxds-cli` keeps it, lists it in the `--json` output's `data.kept`, and exits 3.

## 0.13.1

### Patch Changes

- 704182b: Fix what a fresh chat hit when it followed `SETUP.md` word for word on claude.ai.
  - `SETUP.md` tells Claude to publish `components/index.d.ts` as `text/plain`. An Artifact publish refused it before.
  - The sampler comes as two blocks: link lines for the artboard's `<head>`, and markup for inside its `<x-dc>`. The artboard file is `nxds-sampler.html`.
  - README.md's "On a Design canvas" section names `components/index.d.ts`, so a canvas install copies it and every prop gets a control.
  - The version checks read `meta.version` in `tokens.json`, which holds the release.
  - `bundle.css` sets `box-sizing: border-box` the way Preflight does, so a full-width component no longer grows past its container on a canvas.
  - Icon props show as a text field in the props panel, and the READMEs say so.

## 0.13.0

### Minor Changes

- 6da5b6b: Set up nxds on a Claude Design canvas from one prompt in a Claude chat.
  - The export writes `SETUP.md` beside `project/`. It walks Claude through publishing the system, installing it on a canvas, checking it and updating it to a new release. It isn't part of the published system.
  - `SETUP.md` ships a sampler artboard that writes every attribute form a canvas reads. Claude builds it to check the install.
  - `export claude-design` writes `SETUP.md` and `coverage.md` beside `project/`, and removes an earlier copy the release doesn't have. `--json` reports their paths in `data.root`.
  - `export claude-design` ends by telling Claude to read `SETUP.md` and follow it.

## 0.12.0

### Minor Changes

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

- 990918e: Set every prop a screen needs from a Claude Design canvas, as an attribute, with a control in the props panel.
  - Each attribute takes its prop's type: a bare attribute or `"true"` is true, `"60"` is a number, `default-value="20,80"` is a list, `selected="2026-10-28"` is a date and objects are JSON. A value that doesn't fit logs one `[nxds]` warning and leaves the prop at its default.
  - `index.d.ts` describes each attribute, so text props such as DialogContent `title`, lists, dates, `type` and `target` get controls. `coverage.md` lists the props a canvas doesn't need, and why.
  - `Nxds.Icon name="plus"` places an icon by name, and icon props take names: Button `start-icon="plus"`. 496 Tabler icons ship, with 20 brand logos.
  - `index.d.ts` no longer lists a props interface for each `Nxds.Icons` component. Place icons with `Nxds.Icon`.
  - `Nxds.Toast` shows a toast in place on a static screen.
  - `Nxds.BarChart`, `LineChart`, `AreaChart` and `PieChart` take their rows as JSON. Typed `Nxds.Recharts` parts compose a custom chart, with `data-key` for `dataKey`.

## 0.10.0

## 0.9.0

### Minor Changes

- c0f7d48: Components keep working when a Design canvas wraps each `x-import`. `bundle.css` reaches every part through the wrappers the canvas adds, so button groups join, avatar groups overlap, striped tables tint and divide their rows, icons stay 16px and a label dims beside a disabled checkbox. `as-child` triggers slot the element inside the wrapper, so a popover opens under its button and the button gets `aria-expanded`. Component READMEs write boolean props as `as-child="{{true}}"`, since a bare attribute arrives as false. Component source and installed components don't change.

## 0.8.1

## 0.8.0

### Minor Changes

- bfd0509: Every token the Claude Design System exports is a variable the components read. Changing a token on a canvas now changes the components, including shadows and text styles. `tokens.json` drops the palette steps, alpha scales and state colours no component reads. It keeps the full spacing and radius scales and the chart series for laying out artboards, marked "For authors". The type scale is a new `typeScale` family, and each text style class reads it the way the `nx:typography-*` utilities do.

  On a Design canvas, `data-density`, `data-radius`, `data-borderwidth` and `data-shadow` work again. `tokens.css` declares its values in the `theme` layer, so these presets and the appearance provider's runtime theme override them. The system README names the files a canvas artboard loads and their order.

  Shadows are one variable per elevation step. Each `data-shadow` preset declares `--nx-shadow-sm` and its siblings directly, and `nx:shadow-*` reads them. The `--nx-shadow-*-layer-*` variables are gone. In the token catalogue, shadow styles carry a variant per elevation preset and theme, and the layer primitives are no longer tokens.

  `ToggleGroup` applies a half-step `spacing`, such as `0.5`, instead of dropping the gap. Its `spacing` takes only spacing-scale steps, typed by the new `SpacingStep` export from `@nxds/core`.

## 0.7.0

## 0.6.0

### Minor Changes

- 5daa687: Export nxds as a Claude Design System. `npx nxds-cli export claude-design` writes a folder to publish as a Design System artifact in Claude: every token in Light and Dark, every component as a live React 18 bundle, one props interface per part for the canvas controls, and a preview and README per component. The new `@nxds/claude-design` package carries the prebuilt files and releases with `@nxds/react`.

  The Toaster follows `data-theme="dark"` as well as the `.dark` class. Charts no longer log a size warning on their first render. Every runtime colour token has a usage description.
