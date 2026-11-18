// tokens.json → Figma variables, text styles and effect styles, plus the
// colour and shadow parsing the converter shares.
import { clampRgb, converter, parse } from 'culori';

import type { Kind, TokenValue, ValueKind } from './page.ts';
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
  typeScale?: { tokens: ListToken[] };
  icon?: { tokens: ListToken[] };
  width?: { tokens: ListToken[] };
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

/** Each token's value as the page resolves it, by token name. */
export type TokenValues = Readonly<Record<string, TokenValue>>;

/** A variable's references to other tokens, in light and dark. */
const aliases = (value: TokenValue | undefined) => ({
  ...(value?.lightAlias ? { lightAlias: value.lightAlias } : {}),
  ...(value?.darkAlias ? { darkAlias: value.darkAlias } : {}),
});

function colorVariables(
  tokens: readonly ListToken[],
  values: TokenValues
): VariableSpec[] {
  return tokens.flatMap((token): VariableSpec[] => {
    const page = values[token.name];
    const lightValue = rgba(page?.light ?? light(token.value));
    if (!lightValue) return [];
    const darkText = page?.dark ?? dark(token.value);
    const darkValue = darkText === undefined ? undefined : rgba(darkText);
    return [
      {
        token: token.name,
        name: colorName(token.name),
        type: 'COLOR',
        light: lightValue,
        ...(darkValue ? { dark: darkValue } : {}),
        ...aliases(page),
        description: token.usage,
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
  tokens: readonly ListToken[],
  prefix: string,
  values: TokenValues
): VariableSpec[] {
  return tokens.flatMap((token): VariableSpec[] => {
    const page = values[token.name];
    const value = numberValue(page?.light ?? light(token.value));
    if (!Number.isFinite(value)) return [];
    return [
      {
        token: token.name,
        name: token.name.replace(prefix, ''),
        type: 'FLOAT',
        light: value,
        ...aliases(page),
        description: token.usage,
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

/** The families that become variables, after Color, with each one's name prefix. */
const FLOAT_FAMILIES = [
  'spacing',
  'radius',
  'borderWidth',
  'icon',
  'width',
  'typeScale',
] as const;

/** Every token the page reads a value for: each variable, and each shadow for its effect style. */
export function valueProbes(tokens: TokensFile): [string, ValueKind][] {
  const unit = (token: ListToken): ValueKind =>
    /(px|rem|em)$/.test(light(token.value).trim()) ? 'length' : 'number';
  return [
    ...tokens.color.tokens.map((token): [string, ValueKind] => [
      token.name,
      'color',
    ]),
    ...FLOAT_FAMILIES.flatMap((family) =>
      (tokens[family]?.tokens ?? []).map((token): [string, ValueKind] => [
        token.name,
        unit(token),
      ])
    ),
    ...(tokens.shadow?.tokens ?? []).map((token): [string, ValueKind] => [
      token.name,
      'shadow',
    ]),
  ];
}

/**
 * The variable collections, with the values the page resolved. A palette
 * colour is left out unless a layer in `used` binds it, or another token is
 * declared as a reference to it.
 */
export function collections(
  tokens: TokensFile,
  used: ReadonlySet<string>,
  values: TokenValues
): CollectionSpec[] {
  const referenced = new Set(
    Object.values(values).flatMap((value) =>
      [value.lightAlias, value.darkAlias].filter((name) => name !== undefined)
    )
  );
  return [
    {
      name: 'Color',
      themed: true,
      variables: colorVariables(
        tokens.color.tokens.filter(
          (token) =>
            !isPrimitiveColor(token.name) ||
            used.has(token.name) ||
            referenced.has(token.name)
        ),
        values
      ),
    },
    {
      name: 'Spacing',
      themed: false,
      variables: floatVariables(
        tokens.spacing?.tokens ?? [],
        'nx-spacing-',
        values
      ),
    },
    {
      name: 'Radius',
      themed: false,
      variables: floatVariables(
        tokens.radius?.tokens ?? [],
        'nx-radius-',
        values
      ),
    },
    {
      name: 'Border width',
      themed: false,
      variables: floatVariables(
        tokens.borderWidth?.tokens ?? [],
        'nx-borderwidth-',
        values
      ),
    },
    {
      name: 'Icon',
      themed: false,
      // `nx-icon-glyph-default` → `glyph/default`.
      variables: floatVariables(
        tokens.icon?.tokens ?? [],
        'nx-icon-',
        values
      ).map((variable) => ({
        ...variable,
        name: variable.name.replace(/^([a-z]+)-/, '$1/'),
      })),
    },
    {
      name: 'Width',
      themed: false,
      // `nx-container-sm` → `container/sm`.
      variables: floatVariables(tokens.width?.tokens ?? [], 'nx-', values).map(
        (variable) => ({
          ...variable,
          name: variable.name.replace(/^([a-z]+)-/, '$1/'),
        })
      ),
    },
    {
      name: 'Typography',
      themed: false,
      variables: floatVariables(tokens.typeScale?.tokens ?? [], '', values).map(
        (variable) => ({
          ...variable,
          name: typographyName(variable.token),
        })
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
    ...list(tokens.width, 'length'),
    // Only the icon tokens in px are sizes; the stroke ratio has no unit.
    ...(tokens.icon?.tokens ?? []).flatMap((token): [string, Kind][] =>
      light(token.value).endsWith('px') ? [[token.name, 'length']] : []
    ),
    ...(tokens.typeScale?.tokens ?? []).flatMap((token): [string, Kind][] => {
      if (token.name.startsWith('nx-typography-size-'))
        return [[token.name, 'font-size']];
      if (/^nx-typography-(line-height|letterspacing)-/.test(token.name))
        return [[token.name, 'length']];
      return [];
    }),
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

/** The text styles. `declared` holds the typography tokens each style's class declares. */
export function textStyles(
  tokens: TokensFile,
  declared: Readonly<Record<string, Readonly<Record<string, string>>>>
): TextStyleSpec[] {
  return tokens.type.groups.flatMap((group) =>
    group.styles.map((style) => ({
      name: textStyleName(group.name, style.name),
      token: style.name,
      family: firstFamily(tokens.type.families[group.family] ?? 'Inter'),
      weight: style.fontWeight ?? 400,
      size: px(style.fontSize) ?? 14,
      lineHeight: px(style.lineHeight),
      letterSpacing: px(style.letterSpacing) ?? 0,
      variables: {
        fontSize: declared[style.name]?.['font-size'],
        lineHeight: declared[style.name]?.['line-height'],
        letterSpacing: declared[style.name]?.['letter-spacing'],
      },
      description: style.usage,
    }))
  );
}

/** The shadow styles, with the values the page resolved, such as an app's redefined shadows. */
export function effectStyles(
  tokens: TokensFile,
  values: TokenValues
): EffectStyleSpec[] {
  return (tokens.shadow?.tokens ?? []).map((token) => ({
    name: `shadow/${token.name.replace(/^nx-shadow-/, '')}`,
    token: token.name,
    effects: parseShadows(values[token.name]?.light ?? light(token.value)),
    description: token.usage,
  }));
}
