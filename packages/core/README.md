# @nxds/core

The nxds theme engine. It turns an appearance, such as a brand color, a density
and a font, into the `--nx-*` CSS variables every nxds component reads.

```bash
npm install @nxds/core
```

In a React app, `npx nxds-cli@latest init` installs `@nxds/core` and copies in
a provider that calls it. Use the engine directly in a Vue app, in a non-React
shell such as Electron, or in a tool that reads the tokens.

## Apply a theme

```ts
// src/appearance.ts
import {
  applyNxdsAppearance,
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
  persistNxdsAppearance,
  prefersDarkColorScheme,
} from '@nxds/core';

const appearance = {
  ...DEFAULT_NXDS_APPEARANCE,
  brandColor: '#2563eb',
  surfaceTone: 'slate',
} satisfies NxdsAppearanceState;

applyNxdsAppearance(appearance, prefersDarkColorScheme());
persistNxdsAppearance(appearance, { storageKey: 'app-appearance' });
```

`applyNxdsAppearance` sets the `dark` class and the preset attributes on
`<html>`, and writes the theme CSS into `<head>`. `persistNxdsAppearance` saves
the appearance for the first-paint script.

## Stop the theme flashing on reload

```ts
// vite.config.ts
import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
  DEFAULT_NXDS_APPEARANCE,
} from '@nxds/core';

const script = createNxdsAppearanceBootstrapScript({
  storageKey: 'app-appearance',
  defaultSnapshot: createNxdsAppearanceSnapshotFromState(
    DEFAULT_NXDS_APPEARANCE
  ),
});
```

Put `script` in a `<script>` tag in `<head>`. It applies the saved appearance
before the first paint, so the page doesn't flash the default theme.
[Install](https://nxds.dev/getting-started/install) shows it wired into Vite.

## Exports

| Export                                                                                                                     | What it does                                                       |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `DEFAULT_NXDS_APPEARANCE`, `sanitizeNxdsAppearance`, `NxdsAppearanceState`                                                 | The appearance: its defaults, its validation and its type          |
| `applyNxdsAppearance`, `persistNxdsAppearance`, `readStoredNxdsAppearance`, `watchColorScheme`                             | Apply, save and read an appearance in the browser                  |
| `createNxdsAppearanceSnapshotFromState`, `createNxdsAppearanceBootstrapScript`, `resolveFirstPaint`, `DEFAULT_STORAGE_KEY` | The first-paint script                                             |
| `createNxdsThemeContract`, `deriveTheme`, `themeToCss`                                                                     | Derive the color tokens from an appearance, and render them to CSS |
| `BRAND_COLOR_PRESETS`, `findBrandColorPreset`, `DEFAULT_BRAND_COLOR`                                                       | Brand color choices for an appearance editor                       |
| `measureThemeContrast`                                                                                                     | Measures a derived theme against every contrast pair               |
| `adjustContrast`, `PALETTE_KEYS`, `TIER_THRESHOLDS`, `isColor`                                                             | Low-level palette and contrast helpers. They may change before 1.0 |

`findBrandColorPreset(color)` returns the preset a saved color matches, in any
CSS notation, or `undefined` for a custom color.

## Set your own colors

```ts
// src/appearance.ts
import { applyNxdsAppearance, DEFAULT_NXDS_APPEARANCE } from '@nxds/core';

applyNxdsAppearance(DEFAULT_NXDS_APPEARANCE, false, { deriveColors: false });
```

`deriveColors: false` leaves every color to your own CSS. The mode, the preset
attributes and the fonts still apply. Pass the same option to
`persistNxdsAppearance` and `createNxdsAppearanceSnapshotFromState`.
[Your own colors](https://nxds.dev/theming/own-colors) covers the CSS.

## Check contrast

```ts
// scripts/check-contrast.ts
import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  deriveTheme,
  measureThemeContrast,
} from '@nxds/core';

const checks = measureThemeContrast(
  deriveTheme(createNxdsThemeContract(DEFAULT_NXDS_APPEARANCE))
);
const failing = checks.filter((check) => !check.pass);
```

`measureThemeContrast` returns one check per foreground and background pair in
each mode:

| Field      | Holds                                                        |
| ---------- | ------------------------------------------------------------ |
| `mode`     | `light` or `dark`                                            |
| `fg`, `bg` | The CSS variable names, such as `--nx-color-foreground`      |
| `backdrop` | What a translucent color is composited over before measuring |
| `tier`     | The pair's contrast tier                                     |
| `lc`       | The measured APCA contrast, as an absolute value             |
| `floor`    | The tier's minimum                                           |
| `pass`     | `lc >= floor`                                                |

Under deuteranopia, Success (green) and Warning (orange) are hard to tell apart.
Pair status colors with an icon and a label.

## Look up palette colors

```ts
// src/palette.ts
import { getPaletteRamp, getPaletteShade } from '@nxds/core/palette';

getPaletteShade('green', '600'); // oklch(0.62 0.2233 140.055)
const neutral = getPaletteRamp('neutral');
```

`PRIMITIVE_PALETTE_NAMES` lists the 22 palettes, and `SHADES` lists 50 through 950. `getPaletteShade` returns the shade nxds renders, not the authored hex. To
seed `brandColor` from a palette, use its entry in `BRAND_COLOR_PRESETS`.

## Read the token catalogue

```ts
// scripts/tokens.ts
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import { createTokenCatalogue } from '@nxds/core/catalogue';

const tokens = createTokenCatalogue();
const rose = createTokenCatalogue({
  ...DEFAULT_NXDS_APPEARANCE,
  brandColor: '#e11d48',
});
```

`createTokenCatalogue` lists every token: color, typography, spacing, radius,
border width, shadow, motion, z-index, breakpoints, UI scale and page widths.
Each entry has its
`--nx-*` name, its value in each mode and preset, and the appearance settings
that change it. Pass an appearance to read the tokens at that appearance. The
call derives both color modes, so call it once per build or page, not per
render.

## Docs

- **[Appearance](https://nxds.dev/theming/appearance)**: every field the engine reads.
- **[Tokens](https://nxds.dev/foundations/tokens)**: the token layers and how the engine builds them.
- **[Color](https://nxds.dev/foundations/color)**: how the palette is built and checked.
