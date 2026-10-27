// tokens.json for the Claude Design System format, from the @nxds/core token
// catalogue at the default appearance. A token's name is the custom property
// the components read, minus `--`, so a value edited on the system page
// reaches them.
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';
import type { CatalogueToken, CatalogueVariant } from '@nxds/core/catalogue';
import { createTokenCatalogue } from '@nxds/core/catalogue';

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

const TYPE_FAMILY_KEYS: Record<string, string> = {
  '--nx-typography-family-font-sans': 'sans',
  '--nx-typography-family-font-heading': 'heading',
  '--nx-typography-family-font-serif': 'serif',
  '--nx-typography-family-font-mono': 'mono',
};

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
      return `Elevation \`nx:shadow-${key}\`. Components read its layer variables, so an edit here shows on the page only.`;
    case 'color':
      return `Raw ${token.group} palette step${shown}. Components read the semantic colours; use this for one-off fills only.`;
    default:
      return `\`${token.name}\`${shown}.`;
  }
}

function listToken(token: CatalogueToken, resolve: Resolver): ListToken {
  const value = tokenValue(token, resolve);
  return {
    name: bareName(token.name),
    value,
    usage: token.description ?? scaleUsage(token, value),
  };
}

function isShadowStyle(token: CatalogueToken) {
  return token.variants[0]?.source?.file === 'styles/shadows.json';
}

function isTypographyStyle(token: CatalogueToken) {
  return token.variants[0]?.source?.file === 'styles/typography.json';
}

// Runtime colours first, in registry order, then the primitive palette.
function colorTokens(catalogue: Catalogue, resolve: Resolver) {
  const colors = catalogue.filter((token) => token.family === 'color');
  const derived = colors.filter((token) =>
    token.variants.some((variant) => variant.appearance)
  );
  const primitives = colors.filter((token) => !derived.includes(token));
  return [...derived, ...primitives].map((token) => listToken(token, resolve));
}

function familyTokens(
  catalogue: Catalogue,
  family: keyof typeof LIST_FAMILIES,
  resolve: Resolver
) {
  return catalogue
    .filter((token) => token.family === family)
    .filter((token) => family !== 'shadow' || isShadowStyle(token))
    .map((token) => listToken(token, resolve));
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
  const family = familyVar ? TYPE_FAMILY_KEYS[familyVar] : undefined;
  if (family) style.family = family;
  const lineHeight = length(read('line-height') ?? '');
  if (lineHeight) style.lineHeight = lineHeight;
  const fontWeight = Number(read('font-weight'));
  if (Number.isFinite(fontWeight)) style.fontWeight = fontWeight;
  const letterSpacing = length(read('letter-spacing') ?? '');
  if (letterSpacing) style.letterSpacing = letterSpacing;
  return style;
}

function typeFamily(catalogue: Catalogue, resolve: Resolver) {
  const families = Object.fromEntries(
    Object.entries(TYPE_FAMILY_KEYS).map(([name, key]) => {
      const token = catalogue.find((candidate) => candidate.name === name);
      if (!token) throw new Error(`tokens.json: ${name} is missing.`);
      return [key, resolve(`var(${name})`, 'light')];
    })
  );

  const groups: TokensFile['type']['groups'] = [];
  for (const token of catalogue.filter(isTypographyStyle)) {
    const style = typeStyle(token, resolve);
    let group = groups.find((candidate) => candidate.name === token.group);
    if (!group) {
      group = { name: token.group, family: style.family ?? 'sans', styles: [] };
      groups.push(group);
    }
    if (style.family === group.family) delete style.family;
    group.styles.push(style);
  }

  return { fonts: [] as never[], families, groups };
}

export interface TokensMeta {
  version: string;
  ref: string;
}

export function buildTokens({ version, ref }: TokensMeta): TokensFile {
  const catalogue = createTokenCatalogue();
  const resolve = createResolver(catalogue);
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
    color: { themes: THEMES, tokens: colorTokens(catalogue, resolve) },
    type: typeFamily(catalogue, resolve),
  };
  for (const [family, key] of Object.entries(LIST_FAMILIES)) {
    tokens[key] = {
      tokens: familyTokens(
        catalogue,
        family as keyof typeof LIST_FAMILIES,
        resolve
      ),
    };
  }
  return tokens;
}
