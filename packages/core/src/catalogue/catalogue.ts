import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
} from '../lib/appearance-model';
import { deriveThemeMode } from '../lib/derive-theme';
import type { Mode } from '../lib/palette';
import { SEMANTIC_TOKEN_REGISTRY } from '../lib/token-registry';
import { PAGE_WIDTHS_REM } from '../lib/token-scales.generated';
import {
  formatShadowStyle,
  formatTokenValue,
  formatTypographyDeclarations,
  inlineVariables,
  resolveValue,
} from '../token-source/format';
import {
  SPACING_MODE_FILE_PATTERN,
  spacingRoleUtility,
  spacingTokenKind,
} from '../token-source/spacing';
import {
  type ExtractedToken,
  extractTokens,
  pathToCssVarPrefixed,
  tokenReferences,
} from '../token-source/tokens';
import { type ScaleToken, widthTokens } from '../token-source/ui-scale';
import {
  borderColorAliasName,
  borderWidthAliasUtilities,
  DEFAULT_TRANSITION,
  durationUtility,
  iconUtility,
} from '../token-source/utilities';

import { RUNTIME_COLOR_DESCRIPTIONS } from './descriptions';
import { TOKEN_FILES, type TokenFile } from './token-files';
import type {
  CatalogueAlias,
  CatalogueControl,
  CatalogueDeclaration,
  CatalogueFamily,
  CatalogueReference,
  CatalogueToken,
  CatalogueTokenName,
  CatalogueVariant,
} from './types';

type PrimitiveFamily = Extract<
  CatalogueFamily,
  | 'borderwidth'
  | 'color'
  | 'icon'
  | 'motion'
  | 'radius'
  | 'shadow'
  | 'typography'
>;

const PRIMITIVE_FAMILIES: readonly PrimitiveFamily[] = [
  'borderwidth',
  'color',
  'icon',
  'motion',
  'radius',
  'shadow',
  'typography',
];
const RUNTIME_MODES: readonly Mode[] = ['light', 'dark'];
const Z_INDEX_FILE: TokenFile = 'semantic/z-index.json';
const BREAKPOINTS_FILE: TokenFile = 'semantic/breakpoints.json';
const TYPOGRAPHY_STYLES_FILE: TokenFile = 'styles/typography.json';
const SHADOW_STYLES_FILE: TokenFile = 'styles/shadows.json';
const SINGLE_SOURCE = { mode: null, preset: null } as const;

/** The `[data-ui-scale]` mode, which scales every token it writes. */
const UI_SCALE: CatalogueControl = { kind: 'preset', field: 'uiScale' };

/** The appearance fields that write each moded family's values. */
const FAMILY_CONTROLS: Partial<
  Record<CatalogueFamily, readonly CatalogueControl[]>
> = {
  spacing: [{ kind: 'preset', field: 'density' }, UI_SCALE],
  radius: [{ kind: 'preset', field: 'corners' }, UI_SCALE],
  borderwidth: [{ kind: 'preset', field: 'stroke' }],
  shadow: [{ kind: 'preset', field: 'elevation' }],
};

/** The appearance fields that write each typography primitive. */
function typographyControls(
  path: readonly string[]
): readonly CatalogueControl[] {
  const [group, key] = path;
  if (group === 'code' && key === 'size') {
    return [{ kind: 'pref', field: 'codeFontSize' }, UI_SCALE];
  }
  if (group === 'size' || group === 'line-height') return [UI_SCALE];
  if (group !== 'family') return [];
  if (key === 'font-sans') return [{ kind: 'pref', field: 'uiFont' }];
  if (key === 'font-heading') return [{ kind: 'pref', field: 'headingFont' }];
  if (key === 'font-mono') return [{ kind: 'pref', field: 'codeFont' }];
  return [];
}

function leafControls({
  family,
  file,
  preset,
  leaf,
}: AuthoredLeaf): readonly CatalogueControl[] {
  if (family === 'typography' && file.startsWith('primitives/')) {
    return typographyControls(leaf.path);
  }
  if (family === 'icon') return leaf.path[0] === 'glyph' ? [UI_SCALE] : [];
  if (preset === null) return [];
  return FAMILY_CONTROLS[family] ?? [];
}

/** A `PrimitiveLookup` that also carries each target's canonical name. */
type ReferenceLookup = ReadonlyMap<
  string,
  { cssName: string; name: CatalogueTokenName }
>;

/** The theme mode and preset one token file holds values for. */
interface VariantAxes {
  mode: Mode | null;
  preset: string | null;
}

/** One authored leaf, in the file, theme mode, and preset it came from. */
interface AuthoredLeaf extends VariantAxes {
  family: CatalogueFamily;
  file: TokenFile;
  leaf: ExtractedToken;
}

/** What one leaf contributes: the token it belongs to and its variant's declarations. */
interface LeafEntry {
  name: CatalogueTokenName;
  aliases: readonly CatalogueAlias[];
  declarations: readonly CatalogueDeclaration[];
}

const cssVariable = (name: string): CatalogueAlias => ({
  kind: 'css-variable',
  name,
});
const utility = (name: string): CatalogueAlias => ({
  kind: 'utility',
  name: `nx:${name}`,
});

function tokenFiles(): TokenFile[] {
  return Object.keys(TOKEN_FILES) as TokenFile[];
}

function fileLeaves(
  family: CatalogueFamily,
  file: TokenFile,
  axes: VariantAxes
): AuthoredLeaf[] {
  return extractTokens(TOKEN_FILES[file]).map((leaf) => ({
    family,
    file,
    ...axes,
    leaf,
  }));
}

function primitiveFiles(family: PrimitiveFamily): TokenFile[] {
  return tokenFiles().filter(
    (file) =>
      file === `primitives/${family}.json` ||
      file.startsWith(`primitives/${family}/${family}-`)
  );
}

/**
 * A mode file's suffix split into its preset and theme mode:
 * `shadow-quiet-dark.json` is preset `quiet` in `dark`, and
 * `radius-round.json` is preset `round` in both modes.
 */
function modeFileAxes(file: TokenFile, family: PrimitiveFamily): VariantAxes {
  const suffix = file.slice(
    `primitives/${family}/${family}-`.length,
    -'.json'.length
  );
  const mode = RUNTIME_MODES.find((candidate) =>
    suffix.endsWith(`-${candidate}`)
  );
  if (mode === undefined) return { mode: null, preset: suffix };
  return { mode, preset: suffix.slice(0, -`-${mode}`.length) };
}

function primitiveLeaves(family: PrimitiveFamily): AuthoredLeaf[] {
  const files = primitiveFiles(family);
  return files.flatMap((file) =>
    fileLeaves(
      family,
      file,
      files.length > 1 ? modeFileAxes(file, family) : SINGLE_SOURCE
    )
  );
}

function spacingLeaves(): AuthoredLeaf[] {
  const directory = 'semantic/';
  return tokenFiles().flatMap((file) => {
    if (!file.startsWith(directory)) return [];
    const preset = file
      .slice(directory.length)
      .match(SPACING_MODE_FILE_PATTERN)?.[1];
    if (preset === undefined) return [];
    return fileLeaves('spacing', file, { mode: null, preset });
  });
}

function primitiveName(
  family: CatalogueFamily,
  path: readonly string[]
): CatalogueTokenName {
  return `--nx-${pathToCssVarPrefixed(path, family)}`;
}

/**
 * References resolve the way the generator's primitive map does: bare or
 * family-qualified. A bare path two families share would resolve to whichever
 * the generator loaded last, so it throws instead.
 */
function primitiveLookup(leaves: readonly AuthoredLeaf[]): ReferenceLookup {
  const lookup = new Map<
    string,
    { cssName: string; name: CatalogueTokenName }
  >();
  for (const { family, leaf } of leaves) {
    const name = primitiveName(family, leaf.path);
    const entry = { cssName: name.slice('--'.length), name };
    const reference = leaf.path.join('.');
    for (const key of [reference, `${family}.${reference}`]) {
      const existing = lookup.get(key);
      if (existing && existing.name !== name) {
        throw new Error(
          `catalogue: reference {${key}} matches both ${existing.name} and ${name}`
        );
      }
      lookup.set(key, entry);
    }
  }
  return lookup;
}

function referenceTargets(
  leaf: ExtractedToken,
  lookup: ReferenceLookup
): CatalogueReference[] {
  return tokenReferences(leaf.value).map(({ field, reference }) => {
    const target = lookup.get(reference);
    if (!target) {
      throw new Error(
        `catalogue: ${leaf.path.join('.')} references unknown token {${reference}}`
      );
    }
    return { field, reference, target: target.name };
  });
}

/** A multi-level path is grouped by its first key; a flat file by its family. */
function leafGroup(family: CatalogueFamily, path: readonly string[]): string {
  return path.length > 1 ? (path[0] ?? family) : family;
}

/**
 * Build one token per canonical name, with one variant per leaf that maps to
 * it. Token-level fields come from the first leaf.
 */
function authoredTokens(
  leaves: readonly AuthoredLeaf[],
  lookup: ReferenceLookup,
  entryFor: (leaf: AuthoredLeaf) => LeafEntry
): CatalogueToken[] {
  const tokens = new Map<
    CatalogueTokenName,
    CatalogueToken & { variants: CatalogueVariant[] }
  >();
  for (const authored of leaves) {
    const { family, file, mode, preset, leaf } = authored;
    const { name, aliases, declarations } = entryFor(authored);
    const token = tokens.get(name) ?? {
      name,
      family,
      group: leafGroup(family, leaf.path),
      type: leaf.type,
      description: leaf.description ?? null,
      aliases,
      controls: leafControls(authored),
      variants: [],
    };
    token.variants.push({
      mode,
      preset,
      source: { file, path: leaf.path },
      appearance: null,
      authoredValue: structuredClone(leaf.value),
      declarations,
      references: referenceTargets(leaf, lookup),
    });
    tokens.set(name, token);
  }
  return [...tokens.values()];
}

/** The theme variables and utilities the generator emits for a primitive. */
function primitiveAliases(
  family: CatalogueFamily,
  path: readonly string[]
): CatalogueAlias[] {
  const key = path.join('-');
  if (family === 'icon') return [utility(iconUtility(path).name)];
  if (family === 'radius') return [cssVariable(`--radius-${key}`)];
  if (family === 'borderwidth') {
    return [
      cssVariable(`--border-width-${key}`),
      cssVariable(`--outline-width-${key}`),
      ...borderWidthAliasUtilities(key).map(({ name }) => utility(name)),
    ];
  }
  if (family !== 'motion') return [];
  const [group, motionKey = ''] = path;
  if (group === 'duration') {
    const aliases = [utility(durationUtility(motionKey).name)];
    if (motionKey === DEFAULT_TRANSITION.duration) {
      aliases.push(cssVariable('--default-transition-duration'));
    }
    return aliases;
  }
  if (group === 'ease') {
    const aliases = [cssVariable(`--ease-${motionKey}`)];
    if (motionKey === DEFAULT_TRANSITION.ease) {
      aliases.push(cssVariable('--default-transition-timing-function'));
    }
    return aliases;
  }
  return [];
}

function primitiveEntry(lookup: ReferenceLookup) {
  return ({ family, leaf }: AuthoredLeaf): LeafEntry => {
    const name = primitiveName(family, leaf.path);
    const reference = leaf.path.join('.');
    return {
      name,
      aliases: [
        ...primitiveAliases(family, leaf.path),
        { kind: 'reference', name: reference },
        { kind: 'reference', name: `${family}.${reference}` },
      ],
      declarations: [
        {
          property: name,
          value: resolveValue(leaf.value, lookup, leaf.type, leaf.path),
        },
      ],
    };
  };
}

function spacingEntry({ leaf }: AuthoredLeaf): LeafEntry {
  const key = leaf.path.join('-');
  const name: CatalogueTokenName = `--nx-${key}`;
  const alias =
    spacingTokenKind(leaf.path) === 'role'
      ? utility(spacingRoleUtility(leaf.path).name)
      : cssVariable(`--${key}`);
  return {
    name,
    aliases: [alias],
    declarations: [
      {
        property: name,
        value: formatTokenValue(leaf.value, leaf.type, leaf.path),
      },
    ],
  };
}

/** A z-index layer, declared as its `--nx-*` name with a `@theme` alias. */
function zIndexEntry({ leaf }: AuthoredLeaf): LeafEntry {
  const key = leaf.path.join('-');
  const name: CatalogueTokenName = `--nx-${key}`;
  return {
    name,
    aliases: [cssVariable(`--${key}`)],
    declarations: [
      {
        property: name,
        value: formatTokenValue(leaf.value, leaf.type, leaf.path),
      },
    ],
  };
}

/** A breakpoint, declared only as its `@theme` property. */
function breakpointEntry({ leaf }: AuthoredLeaf): LeafEntry {
  const key = leaf.path.join('-');
  const property = `--${key}`;
  return {
    name: `--nx-${key}`,
    aliases: [cssVariable(property)],
    declarations: [
      { property, value: formatTokenValue(leaf.value, leaf.type, leaf.path) },
    ],
  };
}

function typographyStyleEntry(lookup: ReferenceLookup) {
  return ({ leaf }: AuthoredLeaf): LeafEntry => {
    const key = pathToCssVarPrefixed(leaf.path, 'typography');
    return {
      name: `--nx-${key}`,
      aliases: [utility(key)],
      declarations: formatTypographyDeclarations(leaf.path, leaf.value, lookup),
    };
  };
}

/** Each elevation preset's layer values in one theme mode, keyed by `--name`. */
function shadowLayerSets(
  layers: readonly AuthoredLeaf[],
  lookup: ReferenceLookup
) {
  const sets = new Map<string, VariantAxes & { values: Map<string, string> }>();
  for (const { preset, mode, leaf } of layers) {
    const key = `${preset}/${mode}`;
    const set = sets.get(key) ?? { preset, mode, values: new Map() };
    set.values.set(
      primitiveName('shadow', leaf.path),
      resolveValue(leaf.value, lookup, leaf.type, leaf.path)
    );
    sets.set(key, set);
  }
  return [...sets.values()];
}

/**
 * A shadow style, declared by each elevation preset as its own composite
 * value. The layer primitives it is composed from are not tokens.
 */
function shadowStyleTokens(
  layers: readonly AuthoredLeaf[],
  lookup: ReferenceLookup
): CatalogueToken[] {
  const sets = shadowLayerSets(layers, lookup);
  return styleLeaves('shadow', SHADOW_STYLES_FILE).map(({ leaf }) => {
    const key = pathToCssVarPrefixed(leaf.path, 'shadow');
    const name: CatalogueTokenName = `--nx-${key}`;
    const composite = formatShadowStyle(leaf.path, leaf.value, lookup);
    return {
      name,
      family: 'shadow',
      group: leafGroup('shadow', leaf.path),
      type: leaf.type,
      description: leaf.description ?? null,
      aliases: [cssVariable(`--${key}`)],
      controls: FAMILY_CONTROLS.shadow ?? [],
      variants: sets.map(({ preset, mode, values }) => ({
        mode,
        preset,
        source: { file: SHADOW_STYLES_FILE, path: leaf.path },
        appearance: null,
        authoredValue: structuredClone(leaf.value),
        declarations: [
          { property: name, value: inlineVariables(composite, values) },
        ],
        references: [],
      })),
    };
  });
}

function styleLeaves(family: CatalogueFamily, file: TokenFile): AuthoredLeaf[] {
  return fileLeaves(family, file, SINGLE_SOURCE).filter(
    ({ leaf }) => leaf.type === family
  );
}

function runtimeAppearance(mode: Mode): NxdsAppearanceState {
  return {
    ...DEFAULT_NXDS_APPEARANCE,
    prefs: { ...DEFAULT_NXDS_APPEARANCE.prefs },
    mode,
  };
}

function runtimeColorAliases(name: string): CatalogueAlias[] {
  const aliases = [cssVariable(`--color-${name}`)];
  const borderName = borderColorAliasName(name);
  if (borderName !== null) {
    aliases.push(utility(`border-color-${borderName}`));
  }
  return aliases;
}

function runtimeColorTokens(): CatalogueToken[] {
  const themes = RUNTIME_MODES.map((mode) => {
    const appearance = runtimeAppearance(mode);
    return {
      mode,
      appearance,
      values: deriveThemeMode(createNxdsThemeContract(appearance), mode),
    };
  });

  return SEMANTIC_TOKEN_REGISTRY.map(({ name, category }) => {
    const property: CatalogueTokenName = `--nx-color-${name}`;
    return {
      name: property,
      family: 'color',
      group: category,
      type: 'color',
      description: RUNTIME_COLOR_DESCRIPTIONS[name] ?? null,
      aliases: runtimeColorAliases(name),
      controls: [],
      variants: themes.map(({ mode, appearance, values }) => {
        const value = values[property];
        if (value === undefined) {
          throw new Error(`catalogue: deriveTheme emitted no ${property}`);
        }
        return {
          mode,
          preset: null,
          source: null,
          appearance,
          authoredValue: null,
          declarations: [{ property, value }],
          references: [],
        };
      }),
    };
  });
}

/** A token the UI scale writes and no token file authors. */
function uiScaleToken(
  { cssName, value }: ScaleToken,
  fields: Pick<CatalogueToken, 'group' | 'type' | 'description'>
): CatalogueToken {
  const name: CatalogueTokenName = `--nx-${cssName}`;
  return {
    name,
    family: 'ui-scale',
    ...fields,
    aliases: [],
    controls: [UI_SCALE],
    variants: [
      {
        mode: null,
        preset: null,
        source: null,
        appearance: null,
        authoredValue: null,
        declarations: [{ property: name, value }],
        references: [],
      },
    ],
  };
}

function uiScaleEntry(token: ScaleToken): CatalogueToken {
  if (token.cssName === 'ui-scale') {
    return uiScaleToken(token, {
      group: 'factor',
      type: 'number',
      description:
        'The UI scale as a factor of the Default scale. Multiply a fixed size by it, such as `calc(16rem*var(--nx-ui-scale))`, so the size follows the UI scale.',
    });
  }
  const width = token.cssName.replace('container-', '');
  return uiScaleToken(token, {
    group: 'width',
    type: 'dimension',
    description: `The \`nx:max-w-${width}\` and \`nx:w-${width}\` width. It follows the UI scale.`,
  });
}

/**
 * Every nxds token, identified by its `--nx-*` name: primitives, runtime
 * colours, spacing, z-index, breakpoints, typography and shadow styles, and
 * the UI scale factor and page widths at the Default scale.
 * Shadow layer primitives only compose the shadow styles.
 * Runtime colours are computed from `DEFAULT_NXDS_APPEARANCE` in explicit
 * light and dark modes; each variant records the appearance it used.
 */
export function createTokenCatalogue(): readonly CatalogueToken[] {
  const primitives = PRIMITIVE_FAMILIES.flatMap(primitiveLeaves);
  const lookup = primitiveLookup(primitives);
  const shadowLayers = primitives.filter(({ family }) => family === 'shadow');
  return [
    ...authoredTokens(
      primitives.filter((leaf) => leaf.family !== 'shadow'),
      lookup,
      primitiveEntry(lookup)
    ),
    ...runtimeColorTokens(),
    ...authoredTokens(spacingLeaves(), lookup, spacingEntry),
    ...authoredTokens(
      fileLeaves('z-index', Z_INDEX_FILE, SINGLE_SOURCE),
      lookup,
      zIndexEntry
    ),
    ...authoredTokens(
      fileLeaves('breakpoint', BREAKPOINTS_FILE, SINGLE_SOURCE),
      lookup,
      breakpointEntry
    ),
    ...authoredTokens(
      styleLeaves('typography', TYPOGRAPHY_STYLES_FILE),
      lookup,
      typographyStyleEntry(lookup)
    ),
    ...shadowStyleTokens(shadowLayers, lookup),
    ...widthTokens(PAGE_WIDTHS_REM, 'default').map(uiScaleEntry),
  ];
}
