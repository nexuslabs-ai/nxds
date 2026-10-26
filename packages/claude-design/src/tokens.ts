// tokens.json for the Claude Design System format, from the @nxds/core token
// catalogue at the default appearance. A token's name is the custom property
// the components read, minus `--`, so a value edited on the system page
// reaches them. It holds only the tokens a component reads, plus the scales
// AUTHOR_FAMILIES keeps for laying out artboards.
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { CatalogueToken, CatalogueVariant } from '@nxds/core/catalogue';
import { createTokenCatalogue } from '@nxds/core/catalogue';

import { type ComponentReads, readersOf } from './reads.ts';

export type ThemeId = 'light' | 'dark';
export type ThemedValue = string | Partial<Record<ThemeId, string>>;

export interface ListToken {
  name: string;
  value: ThemedValue;
  usage: string;
}

export interface TypeStyle {
  name: string;
  family?: string;
  fontSize: string;
  lineHeight?: string;
  fontWeight?: number;
  letterSpacing?: string;
  usage: string;
}

export interface TokensFile {
  name: string;
  version: 1;
  meta: Record<string, unknown>;
  color: { themes: { id: ThemeId; name: string }[]; tokens: ListToken[] };
  type: {
    fonts: never[];
    families: Record<string, string>;
    groups: { name: string; family: string; styles: TypeStyle[] }[];
  };
  spacing?: { tokens: ListToken[] };
  radius?: { tokens: ListToken[] };
  shadow?: { tokens: ListToken[] };
  borderWidth?: { tokens: ListToken[] };
  zIndex?: { tokens: ListToken[] };
  typeScale?: { tokens: ListToken[] };
}

const THEMES: { id: ThemeId; name: string }[] = [
  { id: 'light', name: 'Light' },
  { id: 'dark', name: 'Dark' },
];

/** The list families after `color` and `type`, in page order, keyed by catalogue family. */
const LIST_FAMILIES = {
  spacing: 'spacing',
  radius: 'radius',
  shadow: 'shadow',
  borderwidth: 'borderWidth',
  'z-index': 'zIndex',
} as const;

/** Families whose every token stays, read or not, so authors can lay out artboards with the whole scale. */
const AUTHOR_FAMILIES: ReadonlySet<string> = new Set(['spacing', 'radius']);

/** Colours an author passes to a component, such as a chart series in `ChartContainer`'s config. */
const AUTHOR_COLORS = /^--nx-color-chart-categorical-\d+$/;

const FAMILY_VARIABLE = '--nx-typography-family-font-';

/** The variable a `type.families` key's stack is declared under: `sans` is `--nx-typography-family-font-sans`. */
export function familyVariable(key: string) {
  return `${FAMILY_VARIABLE}${key}`;
}

function familyKey(variable: string | undefined) {
  return variable?.startsWith(FAMILY_VARIABLE)
    ? variable.slice(FAMILY_VARIABLE.length)
    : undefined;
}

const VAR_REFERENCE = /var\((--nx-[\w-]+)\)/g;

type Catalogue = readonly CatalogueToken[];
type Resolver = ReturnType<typeof createResolver>;

function bareName(name: string) {
  return name.slice(2);
}

/** The variants the default appearance puts on the page, for one theme mode. */
function defaultVariant(token: CatalogueToken, mode: ThemeId) {
  const field = token.control?.kind === 'preset' ? token.control.field : null;
  const preset = field ? DEFAULT_NXDS_APPEARANCE[field] : null;
  const inPreset = token.variants.filter(
    (variant) => variant.preset === null || variant.preset === preset
  );
  return (
    inPreset.find((variant) => variant.mode === mode) ??
    inPreset.find((variant) => variant.mode === null)
  );
}

function declaredValue(variant: CatalogueVariant | undefined) {
  return variant?.declarations[0]?.value;
}

function createResolver(catalogue: Catalogue) {
  const byName = new Map(catalogue.map((token) => [token.name, token]));

  // Replaces each `var(--nx-*)` with that token's literal value in `mode`.
  return function resolve(value: string, mode: ThemeId): string {
    return value.replace(VAR_REFERENCE, (reference, name: string) => {
      const token = byName.get(name as `--nx-${string}`);
      const resolved = token && declaredValue(defaultVariant(token, mode));
      if (resolved === undefined) {
        throw new Error(`tokens.json: ${reference} has no default value.`);
      }
      return resolve(resolved, mode);
    });
  };
}

function themed(light: string, dark: string): ThemedValue {
  return light === dark ? light : { light, dark };
}

function tokenValue(token: CatalogueToken, resolve: Resolver): ThemedValue {
  const [light, dark] = THEMES.map(({ id }) => {
    const value = declaredValue(defaultVariant(token, id));
    if (value === undefined) {
      throw new Error(`tokens.json: ${token.name} has no default value.`);
    }
    return resolve(value, id);
  }) as [string, string];
  return themed(light, dark);
}

function utilityNames(token: CatalogueToken) {
  return token.aliases
    .filter((alias) => alias.kind === 'utility')
    .map((alias) => `\`${alias.name}\``);
}

function scaleUsage(token: CatalogueToken, value: ThemedValue) {
  const key = bareName(token.name).split('-').pop() ?? '';
  const shown = typeof value === 'string' ? ` (${value})` : '';
  switch (token.family) {
    case 'spacing': {
      const utilities = utilityNames(token);
      if (utilities.length > 0) return `Spacing role ${utilities.join(', ')}.`;
      const step = key.replace('_', '.');
      return `Spacing step ${step}${shown}: \`nx:p-${step}\`, \`nx:gap-${step}\`, \`nx:m-${step}\`.`;
    }
    case 'radius':
      return `Corner radius${shown}: \`nx:rounded-${key}\`.`;
    case 'borderwidth':
      return `Border width${shown}: \`nx:border-width-${key}\`.`;
    case 'shadow':
      return `Elevation \`nx:shadow-${key}\`.`;
    case 'typography':
      return `Type scale ${token.group} \`${key}\`${shown}. The text styles read it.`;
    case 'color':
      return `Raw ${token.group} palette step${shown}.`;
    default:
      return `\`${token.name}\`${shown}.`;
  }
}

function readersText(readers: readonly string[]) {
  if (readers.length <= 4) {
    return readers.length === 1
      ? readers[0]
      : `${readers.slice(0, -1).join(', ')} and ${readers.at(-1)}`;
  }
  return `${readers.slice(0, 3).join(', ')} and ${readers.length - 3} more components`;
}

function listToken(
  token: CatalogueToken,
  resolve: Resolver,
  readers: readonly string[]
): ListToken {
  const value = tokenValue(token, resolve);
  const role = token.description ?? scaleUsage(token, value);
  return {
    name: bareName(token.name),
    value,
    usage:
      readers.length > 0
        ? `${role} Read by ${readersText(readers)}.`
        : `For authors: ${role} No component reads it.`,
  };
}

/** Whether tokens.json keeps `token`: a component reads it, or authors use it. */
function kept(token: CatalogueToken, readers: readonly string[]) {
  return (
    readers.length > 0 ||
    AUTHOR_FAMILIES.has(token.family) ||
    AUTHOR_COLORS.test(token.name)
  );
}

function isShadowStyle(token: CatalogueToken) {
  return token.variants[0]?.source?.file === 'styles/shadows.json';
}

function isTypographyStyle(token: CatalogueToken) {
  return token.variants[0]?.source?.file === 'styles/typography.json';
}

function isTypeScaleStep(token: CatalogueToken) {
  return (
    token.family === 'typography' &&
    token.group !== 'family' &&
    (token.variants[0]?.source?.file.startsWith('primitives/') ?? false)
  );
}

interface Context {
  catalogue: Catalogue;
  resolve: Resolver;
  reads: ComponentReads;
}

function keptTokens(tokens: Catalogue, { resolve, reads }: Context) {
  return tokens.flatMap((token) => {
    const readers = readersOf(reads, token.name);
    return kept(token, readers) ? [listToken(token, resolve, readers)] : [];
  });
}

// Runtime colours first, in registry order, then the primitive palette.
function colorTokens(context: Context) {
  const colors = context.catalogue.filter((token) => token.family === 'color');
  const derived = colors.filter((token) =>
    token.variants.some((variant) => variant.appearance)
  );
  const primitives = colors.filter((token) => !derived.includes(token));
  return keptTokens([...derived, ...primitives], context);
}

function familyTokens(family: keyof typeof LIST_FAMILIES, context: Context) {
  return keptTokens(
    context.catalogue
      .filter((token) => token.family === family)
      .filter((token) => family !== 'shadow' || isShadowStyle(token)),
    context
  );
}

/** The type scale steps a component or a text style reads. */
function typeScaleTokens(context: Context) {
  const styleReads = new Set(
    context.catalogue
      .filter(isTypographyStyle)
      .flatMap((token) => token.variants[0]?.declarations ?? [])
      .flatMap(({ value }) => [...value.matchAll(VAR_REFERENCE)])
      .map(([, name]) => name)
  );
  return context.catalogue.filter(isTypeScaleStep).flatMap((token) => {
    const readers = readersOf(context.reads, token.name);
    if (readers.length === 0 && !styleReads.has(token.name)) return [];
    const value = tokenValue(token, context.resolve);
    const role = token.description ?? scaleUsage(token, value);
    return [
      {
        name: bareName(token.name),
        value,
        usage:
          readers.length > 0
            ? `${role} Read by ${readersText(readers)}.`
            : role,
      },
    ];
  });
}

// `-0.800000011920929px` is a float32 artefact of the source file.
function length(value: string) {
  const match = /^(-?[\d.]+)(px|rem|em|%)?$/.exec(value);
  if (!match) return undefined;
  return `${Number(Number(match[1]).toPrecision(6))}${match[2] ?? ''}`;
}

function typeStyle(token: CatalogueToken, resolve: Resolver): TypeStyle {
  const declarations = new Map(
    (token.variants[0]?.declarations ?? []).map((declaration) => [
      declaration.property,
      declaration.value,
    ])
  );
  const read = (property: string) => {
    const value = declarations.get(property);
    return value === undefined ? undefined : resolve(value, 'light');
  };
  const familyVar = /var\((--nx-[\w-]+)\)/.exec(
    declarations.get('font-family') ?? ''
  )?.[1];
  const fontSize = length(read('font-size') ?? '');
  if (!fontSize) {
    throw new Error(`tokens.json: ${token.name} has no literal font size.`);
  }
  const style: TypeStyle = {
    name: bareName(token.name).replace(/^nx-/, ''),
    fontSize,
    usage:
      token.description ??
      `Text style \`${utilityNames(token)[0] ?? token.name}\`.`,
  };
  const family = familyKey(familyVar);
  if (family) style.family = family;
  const lineHeight = length(read('line-height') ?? '');
  if (lineHeight) style.lineHeight = lineHeight;
  const fontWeight = Number(read('font-weight'));
  if (Number.isFinite(fontWeight)) style.fontWeight = fontWeight;
  const letterSpacing = length(read('letter-spacing') ?? '');
  if (letterSpacing) style.letterSpacing = letterSpacing;
  return style;
}

// The families a text style or a component uses.
function typeFamily({ catalogue, resolve, reads }: Context) {
  const groups: TokensFile['type']['groups'] = [];
  const used = new Set<string>();
  for (const token of catalogue.filter(isTypographyStyle)) {
    const style = typeStyle(token, resolve);
    let group = groups.find((candidate) => candidate.name === token.group);
    if (!group) {
      group = { name: token.group, family: style.family ?? 'sans', styles: [] };
      groups.push(group);
    }
    used.add(style.family ?? group.family);
    if (style.family === group.family) delete style.family;
    group.styles.push(style);
  }

  const families = Object.fromEntries(
    catalogue
      .filter((token) => familyKey(token.name) !== undefined)
      .filter(
        (token) =>
          used.has(familyKey(token.name) ?? '') ||
          readersOf(reads, token.name).length > 0
      )
      .map((token) => [
        familyKey(token.name),
        resolve(`var(${token.name})`, 'light'),
      ])
  );

  return { fonts: [] as never[], families, groups };
}

/**
 * Each text style's class body in tokens.css, by style name: the
 * declarations of the `nx:typography-*` utility it mirrors.
 */
export function typeStyleRules(): Map<string, string[]> {
  return new Map(
    createTokenCatalogue()
      .filter(isTypographyStyle)
      .map((token) => [
        bareName(token.name).replace(/^nx-/, ''),
        (token.variants[0]?.declarations ?? []).map(
          ({ property, value }) => `${property}: ${value};`
        ),
      ])
  );
}

export interface TokensMeta {
  version: string;
  ref: string;
  reads: ComponentReads;
}

export function buildTokens({ version, ref, reads }: TokensMeta): TokensFile {
  const catalogue = createTokenCatalogue();
  const context: Context = {
    catalogue,
    resolve: createResolver(catalogue),
    reads,
  };
  const tokens: TokensFile = {
    name: 'nxds',
    version: 1,
    meta: {
      source: 'nxds',
      package: '@nxds/claude-design',
      version,
      ref,
      appearance: 'default',
    },
    color: { themes: THEMES, tokens: colorTokens(context) },
    type: typeFamily(context),
  };
  for (const [family, key] of Object.entries(LIST_FAMILIES)) {
    tokens[key] = {
      tokens: familyTokens(family as keyof typeof LIST_FAMILIES, context),
    };
  }
  tokens.typeScale = { tokens: typeScaleTokens(context) };
  return tokens;
}
