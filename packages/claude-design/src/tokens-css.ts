// tokens.css laid out as the Design System page compiles it, with three
// changes. The variables sit in the `theme` layer, so the appearance presets
// in bundle.css and the provider's `nx-runtime` layer override them. `.dark`
// stands beside each later theme's selector, since nxds switches dark mode
// with that class. Each text style's class carries the declarations of the
// `nx:typography-*` utility it mirrors, so it reads the same variables as the
// components.
import {
  familyVariable,
  type ListToken,
  type ThemedValue,
  type TokensFile,
} from './tokens.ts';

const TOKENS_CSS_HEADER = '/* nxds — generated from tokens.json */';

/** The order `inRuntimeLayer` from @nxds/core declares, whichever file loads first. */
const LAYER_ORDER =
  '@layer properties, theme, base, components, utilities, nx-runtime;';

/** The families tokens.css declares under the theme selectors. */
const THEMED_FAMILIES = new Set(['color', 'shadow']);

const LIST_FAMILY_KEYS = [
  'color',
  'spacing',
  'radius',
  'shadow',
  'borderWidth',
  'zIndex',
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

  return [
    TOKENS_CSS_HEADER,
    LAYER_ORDER,
    '@layer theme {',
    ...block(`:root, [data-theme="${first}"]`, firstTheme, '  '),
    ...laterThemes,
    ...block(':root', root, '  '),
    '}',
    ...styles,
    '',
  ].join('\n');
}
