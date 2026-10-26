---
'@nxds/claude-design': minor
'@nxds/react': minor
'@nxds/core': minor
---

Every token the Claude Design System exports is a variable the components read. Changing a token on a canvas now changes the components, including shadows and text styles. `tokens.json` drops the palette steps, alpha scales and state colours no component reads. It keeps the full spacing and radius scales and the chart series for laying out artboards, marked "For authors". The type scale is a new `typeScale` family, and each text style class reads it the way the `nx:typography-*` utilities do.

On a Design canvas, `data-density`, `data-radius`, `data-borderwidth` and `data-shadow` work again. `tokens.css` declares its values in the `theme` layer, so these presets and the appearance provider's runtime theme override them. The system README names the files a canvas artboard loads and their order.

Shadows are one variable per elevation step. Each `data-shadow` preset declares `--nx-shadow-sm` and its siblings directly, and `nx:shadow-*` reads them. The `--nx-shadow-*-layer-*` variables are gone. In the token catalogue, shadow styles carry a variant per elevation preset and theme, and the layer primitives are no longer tokens.

`ToggleGroup` applies a half-step `spacing`, such as `0.5`, instead of dropping the gap. Its `spacing` takes only spacing-scale steps, typed by the new `SpacingStep` export from `@nxds/core`.
