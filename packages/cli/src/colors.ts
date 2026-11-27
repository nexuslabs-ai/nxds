import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  NXDS_COLOR_APPEARANCE_KEYS,
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

/** Whether a CSS entry loads the colors file, however its import is quoted. */
export function importsColors(css: string) {
  return css.includes(COLORS_FILE);
}

/** The prop that stops the theme engine deriving colors, in JSX. */
export const DERIVE_COLORS_OFF = 'deriveColors={false}';

/** The same choice, as an option of the snapshot a Vite theme script builds. */
export const DERIVE_COLORS_OFF_OPTION = 'deriveColors: false';

/** The `.dark` class in a selector, and not a longer name such as `.darker`. */
const DARK_CLASS = /\.dark(?![\w-])/;

/**
 * The modes a block's selectors reach: dark when one names the `.dark` class,
 * light when one doesn't. A `:not(.dark)` doesn't name it.
 */
function blockModes(prelude: string) {
  const selectors = prelude.replace(/:not\([^)]*\)/g, '').split(',');
  return {
    light: selectors.some((selector) => !DARK_CLASS.test(selector)),
    dark: selectors.some((selector) => DARK_CLASS.test(selector)),
  };
}

/**
 * The nxds colors a stylesheet sets, by name: in light, under `:root`, and in
 * dark, under `.dark`. A rule for both selectors counts in both. A nested rule
 * is dark when it or a rule around it names `.dark`.
 */
export function colorNames(css: string) {
  const names = { light: new Set<string>(), dark: new Set<string>() };
  // The blocks open at this point, outermost first.
  const open: { light: boolean; dark: boolean }[] = [];
  // Each piece is some text and the `{`, `}` or `;` that ends it.
  const pieces = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{};]*)([{};])/g);
  for (const [, text = '', end] of pieces) {
    if (end === '{') {
      open.push(blockModes(text));
      continue;
    }
    const name = /^\s*--nx-color-([a-z0-9-]+)\s*:/.exec(text)?.[1];
    if (name && open.every((block) => block.light)) names.light.add(name);
    if (name && open.some((block) => block.dark)) names.dark.add(name);
    if (end === '}') open.pop();
  }
  return names;
}

/** The theme fields `flags` set that the engine derives colors from. */
export function colorFields(release: Catalog, flags: ThemeFlags) {
  return release.themeFields.filter(
    (field) =>
      field.flag in flags &&
      (NXDS_COLOR_APPEARANCE_KEYS as readonly string[]).includes(field.key)
  );
}

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
    colorFields(release, flags).map((field) => {
      const value = flags[field.flag];
      return [
        field.key,
        field.kind === 'integer' ? Number(value) : value,
      ] as const;
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
