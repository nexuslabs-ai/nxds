// The app's tokens, as its CSS declares them, → Figma variables, text styles
// and effect styles, plus the colour and shadow parsing the converter shares.
// Every name comes from the `--nx-*` properties on the capture page, and every
// value from the page, so what Figma gets is what the app's CSS renders.
import { clampRgb, converter, parse } from 'culori';

import type { Kind, TokenValue, TypographyFacts, ValueKind } from './page.ts';
import type {
  CollectionSpec,
  EffectStyleSpec,
  Rgba,
  Shadow,
  TextStyleSpec,
  VariableSpec,
} from './spec.ts';

const toRgb = converter('rgb');
const round = (channel: number) => Math.round(channel * 10000) / 10000;

/** A CSS colour in sRGB, clipped into its gamut. Undefined for anything culori can't read. */
export function rgba(css: string): Rgba | undefined {
  const parsed = parse(css.trim());
  if (!parsed) return undefined;
  const { r, g, b, alpha } = clampRgb(toRgb(parsed));
  return { r: round(r), g: round(g), b: round(b), a: round(alpha ?? 1) };
}

/** `#rrggbb` with alpha folded out, for SVG markup Figma imports. */
export function hex({ r, g, b }: Rgba) {
  const channel = (value: number) =>
    Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/** `css` split on `separator` outside parentheses. */
function splitTopLevel(css: string, separator: string) {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of css) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === separator && depth === 0) {
      parts.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter(Boolean);
}

const COLOR =
  /(?:oklch|oklab|rgba?|hsla?|lab|lch|color)\([^)]*\)|#[0-9a-f]{3,8}\b|transparent/i;

/** A `box-shadow` value as Figma shadows, leaving out the empty ones Tailwind stacks in. */
export function parseShadows(css: string): Shadow[] {
  if (!css || css === 'none') return [];
  return splitTopLevel(css, ',').flatMap((part): Shadow[] => {
    const colorText = COLOR.exec(part)?.[0] ?? 'black';
    const color = rgba(colorText);
    const lengths = part
      .replace(colorText, '')
      .replace(/\binset\b/, '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((length) => Number.parseFloat(length));
    const [x = 0, y = 0, blur = 0, spread = 0] = lengths;
    if (!color || color.a === 0) return [];
    if (x === 0 && y === 0 && blur === 0 && spread === 0) return [];
    return [
      {
        type: /\binset\b/.test(part) ? 'INNER_SHADOW' : 'DROP_SHADOW',
        color,
        x,
        y,
        blur,
        spread,
      },
    ];
  });
}

/** The first family in a `font-family` stack, unquoted. */
export function firstFamily(stack: string) {
  return (splitTopLevel(stack, ',')[0] ?? '').replace(/^["']|["']$/g, '');
}

/** The tokens that become variables, by family, each a list of names without `--`. */
export interface TokenList {
  color: string[];
  spacing: string[];
  radius: string[];
  borderWidth: string[];
  shadow: string[];
  icon: string[];
  width: string[];
  typeScale: string[];
}

/** Each family, by the name pattern its tokens share. Layout, motion, z-index and the scale knobs aren't Figma variables. */
const FAMILIES: Readonly<Record<keyof TokenList, RegExp>> = {
  color: /^nx-color-/,
  spacing: /^nx-spacing-/,
  radius: /^nx-radius-/,
  borderWidth: /^nx-borderwidth-/,
  shadow: /^nx-shadow-/,
  icon: /^nx-icon-(?:glyph|stroke)-/,
  width: /^nx-container-(?!p$|gap$)/,
  typeScale:
    /^nx-typography-(?:size|weight|line-height|letterspacing)-|^nx-typography-code-size$/,
};

/** The page's `--nx-*` names sorted into the families that become variables. */
export function tokenList(names: readonly string[]): TokenList {
  const list = (pattern: RegExp) => names.filter((name) => pattern.test(name));
  return {
    color: list(FAMILIES.color),
    spacing: list(FAMILIES.spacing),
    radius: list(FAMILIES.radius),
    borderWidth: list(FAMILIES.borderWidth),
    shadow: list(FAMILIES.shadow),
    icon: list(FAMILIES.icon),
    width: list(FAMILIES.width),
    typeScale: list(FAMILIES.typeScale),
  };
}

/** A weight or the icon stroke ratio is a bare number; every other float token is a length. */
const isNumber = (token: string) =>
  /^nx-typography-weight-|^nx-icon-stroke-ratio$/.test(token);

/** `nx-color-primary-background` → `primary/background`: the first word groups the rest. */
function colorName(token: string) {
  const [group, ...rest] = token.replace(/^nx-color-/, '').split('-');
  return rest.length > 0 ? `${group}/${rest.join('-')}` : (group ?? token);
}

/** Each token's value as the page resolves it, by token name. */
export type TokenValues = Readonly<Record<string, TokenValue>>;

/** A variable's references to other tokens, in light and dark. */
const aliases = (value: TokenValue | undefined) => ({
  ...(value?.lightAlias ? { lightAlias: value.lightAlias } : {}),
  ...(value?.darkAlias ? { darkAlias: value.darkAlias } : {}),
});

function colorVariables(
  tokens: readonly string[],
  values: TokenValues
): VariableSpec[] {
  return tokens.flatMap((token): VariableSpec[] => {
    const page = values[token];
    const lightValue = rgba(page?.light ?? '');
    if (!lightValue) return [];
    const darkValue = page?.dark === undefined ? undefined : rgba(page.dark);
    return [
      {
        token,
        name: colorName(token),
        type: 'COLOR',
        light: lightValue,
        ...(darkValue ? { dark: darkValue } : {}),
        ...aliases(page),
      },
    ];
  });
}

/** The root font size `rem` is measured against: the browser default, since nxds sets none. */
const ROOT_FONT_SIZE = 16;

/** A token's value as a number, with `rem` in px, since Figma has no rem. */
function numberValue(value: string) {
  const parsed = Number.parseFloat(value);
  return value.trim().endsWith('rem') ? parsed * ROOT_FONT_SIZE : parsed;
}

function floatVariables(
  tokens: readonly string[],
  prefix: string,
  values: TokenValues
): VariableSpec[] {
  return tokens.flatMap((token): VariableSpec[] => {
    const page = values[token];
    const value = numberValue(page?.light ?? '');
    if (!Number.isFinite(value)) return [];
    return [
      {
        token,
        name: token.replace(prefix, ''),
        type: 'FLOAT',
        light: value,
        ...aliases(page),
      },
    ];
  });
}

/** A palette colour, such as `nx-color-zinc-900`, rather than a semantic one. */
export const isPrimitiveColor = (token: string) =>
  /^nx-color-[a-z]+-\d+$/.test(token);

/** `nx-typography-line-height-sm` → `line-height/sm`: the scale names the group. */
function typographyName(token: string) {
  const short = token
    .replace(/^nx-typography-/, '')
    .replace(/^letterspacing-/, 'letter-spacing-');
  const match = /^(size|weight|line-height|letter-spacing)-(.+)$/.exec(short);
  return match ? `${match[1]}/${match[2]}` : short;
}

/** The families that become float variables, after Color. */
const FLOAT_FAMILIES = [
  'spacing',
  'radius',
  'borderWidth',
  'icon',
  'width',
  'typeScale',
] as const;

/** Every token the page reads a value for: each variable, and each shadow for its effect style. */
export function valueProbes(tokens: TokenList): [string, ValueKind][] {
  return [
    ...tokens.color.map((token): [string, ValueKind] => [token, 'color']),
    ...FLOAT_FAMILIES.flatMap((family) =>
      tokens[family].map((token): [string, ValueKind] => [
        token,
        isNumber(token) ? 'number' : 'length',
      ])
    ),
    ...tokens.shadow.map((token): [string, ValueKind] => [token, 'shadow']),
  ];
}

/**
 * The variable collections, with the values the page resolved. A palette
 * colour is left out unless a layer in `used` binds it, or another token is
 * declared as a reference to it.
 */
export function collections(
  tokens: TokenList,
  used: ReadonlySet<string>,
  values: TokenValues
): CollectionSpec[] {
  const referenced = new Set(
    Object.values(values).flatMap((value) =>
      [value.lightAlias, value.darkAlias].filter((name) => name !== undefined)
    )
  );
  /** `nx-container-sm` → `container/sm`, `nx-icon-glyph-sm` → `glyph/sm`. */
  const grouped = (variables: VariableSpec[]) =>
    variables.map((variable) => ({
      ...variable,
      name: variable.name.replace(/^([a-z]+)-/, '$1/'),
    }));
  return [
    {
      name: 'Color',
      themed: true,
      variables: colorVariables(
        tokens.color.filter(
          (token) =>
            !isPrimitiveColor(token) || used.has(token) || referenced.has(token)
        ),
        values
      ),
    },
    {
      name: 'Spacing',
      themed: false,
      variables: floatVariables(tokens.spacing, 'nx-spacing-', values),
    },
    {
      name: 'Radius',
      themed: false,
      variables: floatVariables(tokens.radius, 'nx-radius-', values),
    },
    {
      name: 'Border width',
      themed: false,
      variables: floatVariables(tokens.borderWidth, 'nx-borderwidth-', values),
    },
    {
      name: 'Icon',
      themed: false,
      variables: grouped(floatVariables(tokens.icon, 'nx-icon-', values)),
    },
    {
      name: 'Width',
      themed: false,
      variables: grouped(floatVariables(tokens.width, 'nx-', values)),
    },
    {
      name: 'Typography',
      themed: false,
      variables: floatVariables(tokens.typeScale, '', values).map(
        (variable) => ({ ...variable, name: typographyName(variable.token) })
      ),
    },
  ];
}

/** Every token a stand-in traces, with the kind of value it holds. */
export function tracedTokens(tokens: TokenList): [string, Kind][] {
  const list = (names: readonly string[], kind: Kind) =>
    names.map((token): [string, Kind] => [token, kind]);
  return [
    ...list(tokens.color, 'color'),
    ...list(tokens.spacing, 'length'),
    ...list(tokens.radius, 'length'),
    ...list(tokens.borderWidth, 'length'),
    ...list(tokens.shadow, 'shadow'),
    ...list(tokens.width, 'length'),
    ...list(
      tokens.icon.filter((token) => !isNumber(token)),
      'length'
    ),
    ...tokens.typeScale.flatMap((token): [string, Kind][] => {
      if (token.startsWith('nx-typography-size-'))
        return [[token, 'font-size']];
      if (/^nx-typography-(line-height|letterspacing)-/.test(token))
        return [[token, 'length']];
      return [];
    }),
  ];
}

/** `typography-label-caps` → `label/caps`: the first word names the group. */
function textStyleName(token: string) {
  const short = token.replace(/^typography-/, '');
  const [group, ...rest] = short.split('-');
  return rest.length > 0 ? `${group}/${rest.join('-')}` : short;
}

/** A text style for each `nx:typography-*` class the app's CSS defines, as the page resolves it. */
export function textStyles(
  typography: Readonly<Record<string, TypographyFacts>>
): TextStyleSpec[] {
  return Object.entries(typography).map(([token, facts]) => ({
    name: textStyleName(token),
    token,
    family: firstFamily(facts.family),
    weight: facts.weight,
    size: facts.size,
    lineHeight: facts.lineHeight,
    letterSpacing: facts.letterSpacing,
    variables: {
      fontSize: facts.tokens['font-size'],
      lineHeight: facts.tokens['line-height'],
      letterSpacing: facts.tokens['letter-spacing'],
    },
  }));
}

/** The shadow styles, with the values the page resolved, such as an app's redefined shadows. */
export function effectStyles(
  tokens: TokenList,
  values: TokenValues
): EffectStyleSpec[] {
  return tokens.shadow.map((token) => ({
    name: `shadow/${token.replace(/^nx-shadow-/, '')}`,
    token,
    effects: parseShadows(values[token]?.light ?? ''),
  }));
}
