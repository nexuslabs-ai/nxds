# @nxds/claude-design

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
