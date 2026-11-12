// tokens.json → Figma variables, text styles and effect styles, plus the
// colour and shadow parsing the converter shares.
import { clampRgb, converter, parse } from 'culori';

import type { Kind } from './page.ts';
import type {
  CollectionSpec,
  EffectStyleSpec,
  Rgba,
  Shadow,
  TextStyleSpec,
  VariableSpec,
} from './spec.ts';

type Themed = string | { light?: string; dark?: string };

interface ListToken {
  name: string;
  value: Themed;
  usage: string;
}

/** The parts of the release's tokens.json this export reads. */
export interface TokensFile {
  color: { tokens: ListToken[] };
  type: {
    families: Record<string, string>;
    groups: {
      name: string;
      family: string;
      styles: {
        name: string;
        fontSize: string;
        lineHeight?: string;
        fontWeight?: number;
        letterSpacing?: string;
        usage: string;
      }[];
    }[];
  };
  spacing?: { tokens: ListToken[] };
  radius?: { tokens: ListToken[] };
  borderWidth?: { tokens: ListToken[] };
  shadow?: { tokens: ListToken[] };
}

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

const light = (value: Themed) =>
  typeof value === 'string' ? value : (value.light ?? value.dark ?? '');

const dark = (value: Themed) =>
  typeof value === 'string' ? undefined : value.dark;

/** `nx-color-primary-background` → `primary/background`: the first word groups the rest. */
function colorName(token: string) {
  const [group, ...rest] = token.replace(/^nx-color-/, '').split('-');
  return rest.length > 0 ? `${group}/${rest.join('-')}` : (group ?? token);
}

function colorVariables(tokens: readonly ListToken[]): VariableSpec[] {
  return tokens.flatMap((token): VariableSpec[] => {
    const lightValue = rgba(light(token.value));
    if (!lightValue) return [];
    const darkText = dark(token.value);
    const darkValue = darkText === undefined ? undefined : rgba(darkText);
    return [
      {
        token: token.name,
        name: colorName(token.name),
        type: 'COLOR',
        light: lightValue,
        ...(darkValue ? { dark: darkValue } : {}),
        description: token.usage,
      },
    ];
  });
}

function floatVariables(
  tokens: readonly ListToken[],
  prefix: string
): VariableSpec[] {
  return tokens.flatMap((token): VariableSpec[] => {
    const value = Number.parseFloat(light(token.value));
    if (!Number.isFinite(value)) return [];
    return [
      {
        token: token.name,
        name: token.name.replace(prefix, ''),
        type: 'FLOAT',
        light: value,
        description: token.usage,
      },
    ];
  });
}

export function collections(tokens: TokensFile): CollectionSpec[] {
  return [
    {
      name: 'Color',
      themed: true,
      variables: colorVariables(tokens.color.tokens),
    },
    {
      name: 'Spacing',
      themed: false,
      variables: floatVariables(tokens.spacing?.tokens ?? [], 'nx-spacing-'),
    },
    {
      name: 'Radius',
      themed: false,
      variables: floatVariables(tokens.radius?.tokens ?? [], 'nx-radius-'),
    },
    {
      name: 'Border width',
      themed: false,
      variables: floatVariables(
        tokens.borderWidth?.tokens ?? [],
        'nx-borderwidth-'
      ),
    },
  ];
}

/** Every token a stand-in traces, with the kind of value it holds. */
export function tracedTokens(tokens: TokensFile): [string, Kind][] {
  const list = (family: { tokens: ListToken[] } | undefined, kind: Kind) =>
    (family?.tokens ?? []).map((token): [string, Kind] => [token.name, kind]);
  return [
    ...list(tokens.color, 'color'),
    ...list(tokens.spacing, 'length'),
    ...list(tokens.radius, 'length'),
    ...list(tokens.borderWidth, 'length'),
    ...list(tokens.shadow, 'shadow'),
  ];
}

const px = (value: string | undefined) =>
  value === undefined ? undefined : Number.parseFloat(value);

/** `typography-label-caps` in group `label` → `label/caps`. */
function textStyleName(group: string, token: string) {
  const short = token.replace(/^typography-/, '');
  return short.startsWith(`${group}-`)
    ? `${group}/${short.slice(group.length + 1)}`
    : short;
}

export function textStyles(tokens: TokensFile): TextStyleSpec[] {
  return tokens.type.groups.flatMap((group) =>
    group.styles.map((style) => ({
      name: textStyleName(group.name, style.name),
      token: style.name,
      family: firstFamily(tokens.type.families[group.family] ?? 'Inter'),
      weight: style.fontWeight ?? 400,
      size: px(style.fontSize) ?? 14,
      lineHeight: px(style.lineHeight),
      letterSpacing: px(style.letterSpacing) ?? 0,
      description: style.usage,
    }))
  );
}

export function effectStyles(tokens: TokensFile): EffectStyleSpec[] {
  return (tokens.shadow?.tokens ?? []).map((token) => ({
    name: `shadow/${token.name.replace(/^nx-shadow-/, '')}`,
    token: token.name,
    effects: parseShadows(light(token.value)),
    description: token.usage,
  }));
}
