# @nxds/core

The nxds theme engine. It turns an appearance, such as a brand color, a density
and a font, into the `--nx-*` CSS variables every nxds component reads.

```bash
npm install @nxds/core
```

In a React app, `npx nxds-cli@latest init` installs `@nxds/core` and copies in
a provider that calls it. In a Vue app,
[Install by hand](https://nxds.dev/getting-started/install#install-by-hand)
copies in a plugin that calls it. Use the engine directly in a shell without
React or Vue, such as Electron, or in a tool that reads the tokens.

## Apply a theme

Put your app's starting appearance in its own file, so `vite.config.ts` can
import it too:

```ts
// src/appearance-state.ts
import { DEFAULT_NXDS_APPEARANCE, type NxdsAppearanceState } from '@nxds/core';

export const defaultAppearance = {
  ...DEFAULT_NXDS_APPEARANCE,
  brandColor: '#2563eb',
  surfaceTone: 'slate',
} satisfies NxdsAppearanceState;
```

```ts
// src/appearance.ts
import {
  applyNxdsAppearance,
  type NxdsAppearanceState,
  persistNxdsAppearance,
  prefersDarkColorScheme,
  readStoredNxdsAppearance,
} from '@nxds/core';

import { defaultAppearance } from './appearance-state';

applyNxdsAppearance(
  readStoredNxdsAppearance('app-appearance', defaultAppearance),
  prefersDarkColorScheme()
);

export function setAppearance(appearance: NxdsAppearanceState) {
  applyNxdsAppearance(appearance, prefersDarkColorScheme());
  persistNxdsAppearance(appearance, { storageKey: 'app-appearance' });
}
```

`readStoredNxdsAppearance` returns the appearance the user saved, or
`defaultAppearance` on a first visit. `applyNxdsAppearance` sets the `dark`
class and the preset attributes on `<html>`, and writes the theme CSS into
`<head>`.

Call `setAppearance` when the user changes the appearance. It applies the
change, and `persistNxdsAppearance` saves it for the next load.

## Stop the theme flashing on reload

```ts
// vite.config.ts
import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
} from '@nxds/core';
import { defineConfig } from 'vite';

import { defaultAppearance } from './src/appearance-state';

const script = createNxdsAppearanceBootstrapScript({
  storageKey: 'app-appearance',
  defaultSnapshot: createNxdsAppearanceSnapshotFromState(defaultAppearance),
});

export default defineConfig({
  plugins: [
    {
      name: 'nxds-appearance-bootstrap',
      transformIndexHtml(html) {
        return html.replace('</head>', `<script>${script}</script></head>`);
      },
    },
  ],
});
```

The script applies the saved appearance before the first paint, so the page
doesn't flash the default theme. It uses the same storage key as
`persistNxdsAppearance`. If you don't use Vite, put `script` in a `<script>` tag
in `<head>` yourself.

## Main exports

| Export                                                                                                                                                                           | What it does                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `DEFAULT_NXDS_APPEARANCE`, `sanitizeNxdsAppearance`, `NxdsAppearanceState`                                                                                                       | The appearance: its defaults, its validation and its type                                                           |
| `applyNxdsAppearance`, `removeNxdsAppearance`, `persistNxdsAppearance`, `readStoredNxdsAppearance`                                                                               | Apply, remove, save and read an appearance in the browser                                                           |
| `prefersDarkColorScheme`, `watchColorScheme`, `resolveNxdsAppearanceMode`                                                                                                        | Read the OS color scheme, and resolve `system` mode to light or dark                                                |
| `createNxdsAppearanceSnapshotFromState`, `createNxdsAppearanceBootstrapScript`, `resolveFirstPaint`, `DEFAULT_STORAGE_KEY`                                                       | The first-paint script                                                                                              |
| `createNxdsAppearanceSnapshotFromCookie`, `DEFAULT_COOKIE_KEY`                                                                                                                   | The first paint from a cookie, for an app that renders on the server                                                |
| `createNxdsThemeContract`, `deriveTheme`, `themeToCss`                                                                                                                           | Derive the color tokens from an appearance, and render them to CSS                                                  |
| `BRAND_COLOR_PRESETS`, `findBrandColorPreset`, `DEFAULT_BRAND_COLOR`                                                                                                             | Brand color choices for an appearance editor                                                                        |
| `BASE_TONE_OPTIONS`, `UI_SCALE_OPTIONS`, `TEXT_SIZE_OPTIONS`, `DENSITY_OPTIONS`, `CORNER_OPTIONS`, `ELEVATION_OPTIONS`, `STROKE_OPTIONS`, `FONT_OPTIONS`, `ICON_LIBRARY_OPTIONS` | The values and labels for each other field, for an appearance editor                                                |
| `shuffleNxdsAppearance`                                                                                                                                                          | A random brand color, surface tone, density, corners, elevation, stroke and fonts. The rest of the appearance stays |
| `shuffleNxdsIconLibrary`                                                                                                                                                         | A random icon library                                                                                               |
| `NxdsTheme`, `DEFAULT_NXDS_THEME`                                                                                                                                                | A theme: an appearance, and the icon library the app installs                                                       |
| `nxdsThemeFlags`, `applyNxdsThemeFlags`                                                                                                                                          | Turn a theme into `nxds-cli init` flags, and flags into a theme                                                     |
| `measureThemeContrast`                                                                                                                                                           | Measures a derived theme against every contrast pair                                                                |
| `adjustContrast`, `PALETTE_KEYS`, `TIER_THRESHOLDS`, `isColor`                                                                                                                   | Low-level palette and contrast helpers. They may change before 1.0                                                  |

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

| Field      | Holds                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| `mode`     | `light` or `dark`                                                                                    |
| `fg`, `bg` | The CSS variable names, such as `--nx-color-foreground`                                              |
| `backdrop` | Optional. The CSS variable or hex color a translucent background is composited over before measuring |
| `tier`     | The pair's contrast tier                                                                             |
| `lc`       | The measured APCA contrast, as an absolute value                                                     |
| `floor`    | The tier's minimum                                                                                   |
| `pass`     | `lc >= floor`                                                                                        |

## Look up palette colors

```ts
// src/palette.ts
import { getPaletteRamp, getPaletteShade } from '@nxds/core/palette';

getPaletteShade('green', '600'); // oklch(0.62 0.2233 140.055)
const neutral = getPaletteRamp('neutral');
```

`PRIMITIVE_PALETTE_NAMES` lists the 22 palettes, and `SHADES` lists the shades
from 50 through 950. `getPaletteShade` returns the shade nxds renders, not the
authored hex.

`BRAND_COLOR_PRESETS` holds nine presets. The first, Default, is
`DEFAULT_BRAND_COLOR`. The other eight are the authored 600 hex of Indigo, Blue,
Violet, Rose, Orange, Amber, Green and Teal. To seed `brandColor` from a preset,
use its `color`.

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
Each entry has its `--nx-*` name, its value in each mode and preset, and the
appearance settings that change it.

Pass an appearance to read the tokens at that appearance. The call derives both
color modes, so call it once per build or page, not per render.

## Docs

- **[Appearance](https://nxds.dev/theming/appearance)**: every field the engine reads.
- **[Tokens](https://nxds.dev/foundations/tokens)**: the token layers and how the engine builds them.
- **[Color](https://nxds.dev/foundations/color)**: how the palette is built and checked.
