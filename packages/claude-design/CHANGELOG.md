# @nxds/claude-design

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
