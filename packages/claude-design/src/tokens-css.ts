// tokens.css laid out as the Design System page compiles it, so the page's
// own compile of tokens.json and this file agree. The one addition is `.dark`
// beside each later theme's selector: nxds switches dark mode with that class.
import type {
  ListToken,
  ThemedValue,
  TokensFile,
  TypeStyle,
} from './tokens.ts';

const TOKENS_CSS_HEADER = '/* nxds — generated from tokens.json */';

/** The families tokens.css declares under the theme selectors. */
const THEMED_FAMILIES = new Set(['color', 'shadow']);

function cssValue(value: string) {
  const alias = /^\{(.+)\}$/.exec(value);
  return alias ? `var(--${alias[1]})` : value;
}

function valueIn(value: ThemedValue, theme: string, first: string) {
  if (typeof value === 'string') return theme === first ? value : undefined;
  return value[theme as keyof typeof value];
}

function block(selector: string, lines: string[]) {
  if (lines.length === 0) return [];
  return [`${selector} {`, ...lines.map((line) => `  ${line}`), '}'];
}

function listFamilies(tokens: TokensFile) {
  return Object.entries(tokens).flatMap(([key, family]) => {
    if (key === 'type' || key === 'meta') return [];
    const list = (family as { tokens?: ListToken[] } | undefined)?.tokens;
    return Array.isArray(list) ? [[key, list] as const] : [];
  });
}

function styleDeclarations(style: TypeStyle, groupFamily: string) {
  const lines = [
    `font-family: var(--font-${style.family ?? groupFamily});`,
    `font-size: ${style.fontSize};`,
  ];
  if (style.lineHeight) lines.push(`line-height: ${style.lineHeight};`);
  if (style.fontWeight) lines.push(`font-weight: ${style.fontWeight};`);
  if (style.letterSpacing) {
    lines.push(`letter-spacing: ${style.letterSpacing};`);
  }
  return lines;
}

export function compileTokensCss(tokens: TokensFile): string {
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
      })
    )
  );

  const root = [
    ...plainTokens.flatMap((token) =>
      typeof token.value === 'string' ? [declare(token, token.value)] : []
    ),
    ...Object.entries(tokens.type.families).map(
      ([key, stack]) => `--font-${key}: ${stack};`
    ),
  ];

  const styles = tokens.type.groups.flatMap((group) =>
    group.styles.flatMap((style) =>
      block(`.${style.name}`, styleDeclarations(style, group.family))
    )
  );

  return [
    TOKENS_CSS_HEADER,
    ...block(`:root, [data-theme="${first}"]`, firstTheme),
    ...laterThemes,
    ...block(':root', root),
    ...styles,
    '',
  ].join('\n');
}
