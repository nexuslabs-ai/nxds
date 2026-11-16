import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  sanitizeNxdsAppearance,
} from '@nxds/core/source/lib/appearance-model.ts';
import {
  deriveTheme,
  type TokenMap,
} from '@nxds/core/source/lib/derive-theme.ts';
import {
  SEMANTIC_TOKEN_REGISTRY,
  type TokenCategory,
} from '@nxds/core/source/lib/token-registry.ts';

import type { Catalog } from './catalog';
import type { ThemeFlags } from './theme';

/** The file `init --own-colors` writes, beside the nxds CSS entry. */
export const COLORS_FILE = 'nxds-colors.css';

/** The line that loads it, in the nxds CSS entry. */
export const COLORS_IMPORT = `@import './${COLORS_FILE}';`;

/** The prop that stops the theme engine deriving colors, in JSX. */
export const DERIVE_COLORS_OFF = 'deriveColors={false}';

/** The appearance fields the engine derives every color from. */
const COLOR_INPUTS = new Set([
  'brandColor',
  'surfaceTone',
  'lightContrast',
  'darkContrast',
]);

const CATEGORY_LABELS: Record<TokenCategory, string> = {
  surface: 'Surfaces',
  text: 'Text',
  border: 'Borders',
  brand: 'Primary and secondary',
  status: 'Status',
  chart: 'Charts',
  syntax: 'Code',
  focus: 'Focus rings',
  alpha: 'Translucent layers',
};

/** The color inputs the theme's flags set, by appearance field. */
function colorInputs(release: Catalog, flags: ThemeFlags) {
  return Object.fromEntries(
    release.themeFields.flatMap((field) => {
      const value = flags[field.flag];
      if (value === undefined || !COLOR_INPUTS.has(field.key)) return [];
      return [[field.key, field.kind === 'integer' ? Number(value) : value]];
    })
  );
}

function colorBlock(selector: string, colors: TokenMap) {
  const groups = Object.entries(CATEGORY_LABELS).map(([category, label]) =>
    [
      `    /* ${label} */`,
      ...SEMANTIC_TOKEN_REGISTRY.filter(
        (token) => token.category === category
      ).map(
        ({ name }) => `    --nx-color-${name}: ${colors[`--nx-color-${name}`]};`
      ),
    ].join('\n')
  );
  return `  ${selector} {\n${groups.join('\n\n')}\n  }`;
}

/**
 * `nxds-colors.css`: every nxds color, light and dark, at the value the theme
 * engine derives for the theme `flags` set. The app owns the file from then on.
 */
export function colorsCss(release: Catalog, flags: ThemeFlags) {
  const theme = deriveTheme(
    createNxdsThemeContract(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        ...colorInputs(release, flags),
      })
    )
  );
  return [
    '/*',
    " * Your app's colors. nxds-cli wrote this file once, from your theme, and",
    ' * does not change it again. Edit any value.',
    ' *',
    ' * It sits in the theme layer, after the nxds tokens. That replaces the nxds',
    ' * colors, and the density, corner and elevation settings still work.',
    ' */',
    '@layer theme {',
    colorBlock(':root', theme.light),
    '',
    colorBlock('.dark', theme.dark),
    '}',
    '',
  ].join('\n');
}
