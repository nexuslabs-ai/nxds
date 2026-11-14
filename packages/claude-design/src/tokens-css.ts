// tokens.css laid out as the Design System page compiles it, with five
// changes. The variables sit in the `theme` layer, so the appearance presets
// in bundle.css and the provider's `nx-runtime` layer override them. A system
// at another UI scale declares its density and corner presets outside the
// layers, so they replace bundle.css's Default-scale ones. `.dark`
// stands beside each later theme's selector, since nxds switches dark mode
// with that class. Each text style's class carries the declarations of the
// `nx:typography-*` utility it mirrors, so it reads the same variables as the
// components. And the Google Fonts families in `meta.fonts` load from one
// `@import`, so every artboard that links tokens.css gets them.
import { RUNTIME_LAYER_ORDER } from '@nxds/core';

import {
  familyVariable,
  type ListToken,
  type ThemedValue,
  type TokensFile,
} from './tokens.ts';

const TOKENS_CSS_HEADER = '/* nxds — generated from tokens.json */';

const GOOGLE_FONTS_CSS = 'https://fonts.googleapis.com/css2';

/** The weights nxds sets text in. */
const FONT_WEIGHTS = '400;500;600;700';

/** The Google Fonts stylesheet that loads `families`, each at nxds's weights. */
export function googleFontsUrl(families: readonly string[]) {
  const query = families
    .map(
      (family) => `family=${family.replaceAll(' ', '+')}:wght@${FONT_WEIGHTS}`
    )
    .join('&');
  return `${GOOGLE_FONTS_CSS}?${query}&display=swap`;
}

/** The families tokens.css declares under the theme selectors. */
const THEMED_FAMILIES = new Set(['color', 'shadow']);

const LIST_FAMILY_KEYS = [
  'color',
  'spacing',
  'radius',
  'shadow',
  'borderWidth',
  'zIndex',
  'motion',
  'icon',
  'uiScale',
  'width',
  'typeScale',
] as const;

/**
 * Every family that holds a token list, in page order, with its tokens. The
 * validator compiles a tokens.json it hasn't checked yet, so a family that
 * isn't a list is skipped.
 */
export function listFamilies(tokens: TokensFile) {
  return LIST_FAMILY_KEYS.flatMap((key) => {
    const list = tokens[key]?.tokens;
    return Array.isArray(list) ? [[key, list] as const] : [];
  });
}

function cssValue(value: string) {
  const alias = /^\{(.+)\}$/.exec(value);
  return alias ? `var(--${alias[1]})` : value;
}

function valueIn(value: ThemedValue, theme: string, first: string) {
  if (typeof value === 'string') return theme === first ? value : undefined;
  return value[theme as keyof typeof value];
}

function block(selector: string, lines: string[], indent = '') {
  if (lines.length === 0) return [];
  return [
    `${indent}${selector} {`,
    ...lines.map((line) => `${indent}  ${line}`),
    `${indent}}`,
  ];
}

/**
 * `styleRules` holds each text style's class body by style name, one
 * declaration a line.
 */
export function compileTokensCss(
  tokens: TokensFile,
  styleRules: ReadonlyMap<string, readonly string[]>
): string {
  const themes = tokens.color.themes.map((theme) => theme.id);
  const [first = 'light', ...later] = themes;
  const families = listFamilies(tokens);
  const themedTokens = families
    .filter(([key]) => THEMED_FAMILIES.has(key))
    .flatMap(([, list]) => list);
  const plainTokens = families
    .filter(([key]) => !THEMED_FAMILIES.has(key))
    .flatMap(([, list]) => list);

  const declare = (token: ListToken, value: string) =>
    `--${token.name}: ${cssValue(value)};`;

  const firstTheme = themedTokens.flatMap((token) => {
    const value = valueIn(token.value, first, first);
    return value === undefined ? [] : [declare(token, value)];
  });

  const laterThemes = later.flatMap((theme) =>
    block(
      `[data-theme="${theme}"], .${theme}`,
      themedTokens.flatMap((token) => {
        const value = valueIn(token.value, theme, first);
        return value === undefined ? [] : [declare(token, value)];
      }),
      '  '
    )
  );

  const root = [
    ...plainTokens.flatMap((token) =>
      typeof token.value === 'string' ? [declare(token, token.value)] : []
    ),
    ...Object.entries(tokens.type.families).map(
      ([key, stack]) => `${familyVariable(key)}: ${stack};`
    ),
  ];

  const styles = tokens.type.groups.flatMap((group) =>
    group.styles.flatMap((style) => {
      const rule = styleRules.get(style.name);
      if (!rule) throw new Error(`tokens.css: no rule for ${style.name}.`);
      return block(`.${style.name}`, [...rule]);
    })
  );

  const fonts = tokens.meta?.fonts ?? [];
  return [
    TOKENS_CSS_HEADER,
    RUNTIME_LAYER_ORDER,
    ...(fonts.length > 0 ? [`@import url("${googleFontsUrl(fonts)}");`] : []),
    '@layer theme {',
    ...block(`:root, [data-theme="${first}"]`, firstTheme, '  '),
    ...laterThemes,
    ...block(':root', root, '  '),
    '}',
    ...(tokens.meta?.presets ?? []).flatMap(({ attribute, value, tokens }) =>
      block(
        `[${attribute}="${value}"]`,
        Object.entries(tokens).map(
          ([name, token]) => `--${name}: ${cssValue(token)};`
        )
      )
    ),
    ...styles,
    '',
  ].join('\n');
}
