/**
 * The shape of `generated/catalog.json`, which `generate-catalog.mjs` writes
 * and the docs install blocks read, and of each release catalog the
 * `nxds-cli` fetches from the registry. The generator and the CLI both
 * validate against these schemas, and the types are inferred from them.
 */
import type { NxdsThemeField } from '@nxds/core';
import path from 'node:path';
import { valid, validRange } from 'semver';
import { z } from 'zod';

/**
 * `value` as a POSIX path inside a folder, such as `ui/button.tsx`, or null
 * when it is absolute, leaves the folder, or holds a control character such
 * as a newline.
 */
export function relativePath(value: string) {
  const normalized = path.posix
    .normalize(value.replaceAll('\\', '/'))
    .replace(/\/+$/, '');
  if (
    [...normalized].some((char) => char < ' ' || char === '\u007f') ||
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    return null;
  }
  return normalized;
}

/** A path already in `relativePath`'s form. */
export const relativePathSchema = z
  .string()
  .refine(
    (value) => relativePath(value) === value,
    'must be a relative path that stays inside its folder'
  );

/** A release version such as `0.5.0`, exactly as `semver` prints it. */
export const versionSchema = z
  .string()
  .refine((value) => valid(value) === value, 'must be a release version');

/**
 * A semver range exactly as written: `validRange` trims its input and reads a
 * blank range as `*`, so padding and control characters are rejected first.
 */
const rangeSchema = z
  .string()
  .refine(
    (value) =>
      /^[ -~]+$/.test(value) &&
      value === value.trim() &&
      validRange(value) !== null,
    'must be a semver range'
  );

const npmNameSchema = z
  .string()
  .regex(
    /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/,
    'must be an npm package name'
  );

const frameworkSchema = z.enum(['react', 'vue']);

export type Framework = z.infer<typeof frameworkSchema>;

function isFramework(value: string): value is Framework {
  return frameworkSchema.safeParse(value).success;
}

/**
 * Each framework's variant. An object, not a record, so a release with a
 * framework this version doesn't know still parses, without that variant.
 */
function variantsSchema<V extends z.ZodType>(variant: V) {
  return z.object({
    react: variant.optional(),
    vue: variant.optional(),
  } satisfies Record<Framework, z.ZodOptional<V>>);
}

const catalogFileSchema = z.object({
  /** Relative to the project's nxds folder. */
  path: relativePathSchema,
  content: z.string(),
});

export type CatalogFile = z.infer<typeof catalogFileSchema>;

/** A change to the app's own files that the CLI's framework adapter makes. */
const setupStepSchema = z.enum([
  'add-css-import',
  'add-head-script',
  'wrap-root-with-provider',
]);

export type SetupStep = z.infer<typeof setupStepSchema>;

const npmPackagesSchema = z.record(npmNameSchema, rangeSchema);

/** The React major an app's files are for. */
export const reactMajorSchema = z.union([z.literal(18), z.literal(19)]);

export type ReactMajor = z.infer<typeof reactMajorSchema>;

/**
 * What a React variant changes for an app on React 18, from packages/react-18:
 * the files whose content differs, and packages whose range differs.
 */
const react18Schema = z.object({
  files: z.array(catalogFileSchema),
  packages: z.object({ npm: npmPackagesSchema }),
});

/** A replacement of `content.slice(start, end)`: `[start, end, text]`. */
const editSchema = z.tuple([
  z.number().int().nonnegative(),
  z.number().int().nonnegative(),
  z.string(),
]);

type Edit = z.infer<typeof editSchema>;

const storyFileSchema = z.object({
  /** Relative to the project's nxds folder. */
  path: relativePathSchema,
  /** The file as the release's first icon library draws it. */
  content: z.string(),
  /** What each other icon library changes in `content`, by library name. */
  icons: z.record(z.string(), z.array(editSchema)).optional(),
});

type StoryFile = z.infer<typeof storyFileSchema>;

/**
 * A variant's Storybook stories, which an app installs only when it asks for
 * stories: the files, and what they need beyond the variant itself.
 */
const storiesSchema = z.object({
  /** Other items the stories use. */
  items: z.array(z.string()),
  packages: z.object({ npm: npmPackagesSchema }),
  files: z.array(storyFileSchema),
  /** The files whose content differs for an app on React 18. */
  react18: z.object({ files: z.array(storyFileSchema) }).optional(),
});

type Stories = z.infer<typeof storiesSchema>;

/** A variant with `packages`, whose `css` names only files in its `files`. */
function variantWith<P extends z.ZodType>(packages: P) {
  return z
    .object({
      /** Other items this one needs, installed first. */
      items: z.array(z.string()),
      packages,
      files: z.array(catalogFileSchema),
      /** Files in `files` the nxds CSS entry imports. */
      css: z.array(relativePathSchema),
      steps: z.array(setupStepSchema),
      react18: react18Schema.optional(),
      stories: storiesSchema.optional(),
    })
    .refine(
      ({ css, files }) =>
        css.every((entry) => files.some((file) => file.path === entry)),
      { path: ['css'], message: 'must name files in `files`' }
    )
    .refine(
      ({ files, react18 }) =>
        (react18?.files ?? []).every((file) =>
          files.some((own) => own.path === file.path)
        ),
      {
        path: ['react18', 'files'],
        message: 'must replace files in `files`',
      }
    )
    .refine(
      ({ stories }) =>
        (stories?.react18?.files ?? []).every((file) =>
          stories?.files.some((own) => own.path === file.path)
        ),
      {
        path: ['stories', 'react18', 'files'],
        message: 'must replace files in `stories.files`',
      }
    );
}

/** `variant` as an app on `react` installs it. */
export function variantForReact<V extends Variant>(
  variant: V,
  react: ReactMajor
): V {
  if (react === 19 || !variant.react18) return variant;
  const replaced = new Map(
    variant.react18.files.map((file) => [file.path, file])
  );
  return {
    ...variant,
    files: variant.files.map((file) => replaced.get(file.path) ?? file),
    packages: {
      ...variant.packages,
      npm: { ...variant.packages.npm, ...variant.react18.packages.npm },
    },
  };
}

const variantSchema = variantWith(z.object({ npm: npmPackagesSchema }));

export type Variant = z.infer<typeof variantSchema>;

const setupVariantSchema = variantWith(
  z.object({
    npm: npmPackagesSchema,
    /** The Tailwind range `init` installs, with the app's build plugin, when the app has no Tailwind. */
    tailwind: rangeSchema,
  })
);

export type SetupVariant = z.infer<typeof setupVariantSchema>;

const itemInfo = {
  name: z.string(),
  title: z.string(),
  description: z.string(),
  docs: z.string(),
};

const setupItemSchema = z.object({
  ...itemInfo,
  kind: z.literal('setup'),
  variants: variantsSchema(setupVariantSchema),
});

export type SetupItem = z.infer<typeof setupItemSchema>;

const catalogItemSchema = z.discriminatedUnion('kind', [
  setupItemSchema,
  z.object({
    ...itemInfo,
    kind: z.enum(['component', 'block']),
    variants: variantsSchema(variantSchema),
  }),
]);

export type CatalogItem = z.infer<typeof catalogItemSchema>;

const iconLibrarySchema = z.object({
  name: z.string(),
  label: z.string(),
  /** `lib/icons.ts`, drawn by this library. */
  file: catalogFileSchema,
  /** The packages `file` imports. */
  npm: npmPackagesSchema,
});

export type IconLibrary = z.infer<typeof iconLibrarySchema>;

const fontSchema = z.object({
  /** Its `init` flag value, such as `inter`. */
  name: z.string(),
  /** Its kind, such as `sans` or `mono`, which decides the flags that take it. */
  category: z.string(),
  /** The `font-family` stack the appearance prefs store. */
  family: z.string(),
  /** The Fontsource package that self-hosts the font, and its range. */
  package: npmNameSchema,
  range: rangeSchema,
});

export type Font = z.infer<typeof fontSchema>;

const themeFieldInfo = {
  /** Its `init` flag, without the `--`, such as `density`. */
  flag: z.string(),
  /** The appearance field it sets, such as `density` or `prefs.uiFont`. The CLI writes it into `nxds-theme.ts` as source. */
  key: z.string().regex(/^(prefs\.)?[A-Za-z]+$/),
};

const themeFieldSchema = z.discriminatedUnion('kind', [
  z.object({ ...themeFieldInfo, kind: z.literal('color') }),
  z.object({
    ...themeFieldInfo,
    kind: z.literal('choice'),
    values: z.array(z.string()).min(1),
  }),
  z.object({
    ...themeFieldInfo,
    kind: z.literal('integer'),
    min: z.number().int(),
    max: z.number().int(),
  }),
  z.object({
    ...themeFieldInfo,
    kind: z.literal('font'),
    /** It takes the release's fonts of these categories, and `fallback.value`. */
    categories: z.array(z.string()).min(1),
    /** The value that names no font, and the family it writes. */
    fallback: z.object({ value: z.string(), family: z.string().nullable() }),
  }),
]);

export type ThemeField = z.infer<typeof themeFieldSchema>;

const THEME_FIELD_KINDS: string[] = themeFieldSchema.options.map(
  (option) => option.shape.kind.value
);

/**
 * The catalog's copy of one of core's theme fields: what the CLI needs to
 * check and write its flag. Null for `--icons`, since the release lists its
 * icon libraries.
 */
export function catalogThemeField(field: NxdsThemeField): ThemeField | null {
  if (field.key === undefined) return null;
  const { flag, key } = field;
  switch (field.kind) {
    case 'color':
      return { flag, key, kind: field.kind };
    case 'choice':
      return { flag, key, kind: field.kind, values: [...field.values] };
    case 'integer':
      return { flag, key, kind: field.kind, min: field.min, max: field.max };
    case 'font':
      return {
        flag,
        key,
        kind: field.kind,
        categories: [...field.categories],
        fallback: field.fallback,
      };
  }
}

/** The `schema` this package writes and the CLI reads. */
export const CATALOG_SCHEMA = 1;

export const catalogSchema = z.object({
  schema: z.literal(CATALOG_SCHEMA),
  /** The `@nxds/react` version this catalog was built from. */
  version: versionSchema,
  /** The frameworks the CLI installs. The docs copy also carries variants for others; a release catalog drops them. Names this version doesn't know are dropped too. */
  frameworks: z
    .array(z.string())
    .transform((frameworks) => frameworks.filter(isFramework)),
  /** The React majors this release has files for. Releases from before React 18 support leave it out, and have React 19 files only. */
  reactMajors: z.array(reactMajorSchema).nonempty().default([19]),
  items: z.array(catalogItemSchema),
  /** The libraries React's `lib/icons.ts` can draw. Items carry the first one's file. Releases from before icon libraries leave it out. */
  iconLibraries: z.array(iconLibrarySchema).default([]),
  /** The fonts an app can start with. Releases from before fonts leave it out. */
  fonts: z.array(fontSchema).default([]),
  /** The theme flags this release's `@nxds/core` takes, beside `--icons`. Releases from before themes leave it out. Kinds this version doesn't know are dropped. */
  themeFields: z
    .array(z.looseObject({ kind: z.string() }))
    .transform((fields) =>
      fields.filter((field) => THEME_FIELD_KINDS.includes(field.kind))
    )
    .pipe(z.array(themeFieldSchema))
    .default([]),
  /** Whether an app on this release can set its own colors: its provider takes `deriveColors`. Releases from before own colors leave it out. */
  ownColors: z.boolean().default(false),
  /** The Storybook the release's stories run in. Releases from before stories leave it out. */
  storybook: z
    .object({
      /** The Storybook versions the stories run on. */
      range: rangeSchema,
      /** The Storybook framework packages a story can import its types from. The files name the first. */
      frameworks: z.array(npmNameSchema).nonempty(),
    })
    .optional(),
});

export type Catalog = z.infer<typeof catalogSchema>;

// A record key's own issues are nested in its `invalid_key` issue.
function lines(issues: z.core.$ZodIssue[], prefix: PropertyKey[]): string[] {
  return issues.flatMap((issue) => {
    const at = [...prefix, ...issue.path];
    if (issue.code === 'invalid_key') return lines(issue.issues, at);
    return [
      `${at.length > 0 ? at.map(String).join('.') : '(root)'}: ${issue.message}`,
    ];
  });
}

/** Each issue as `path: message`, such as `items.3.variants.react.files: …`. */
export function issueLines(error: z.ZodError) {
  return lines(error.issues, []);
}

function installedVariants<V extends Variant>(
  variants: Partial<Record<Framework, V>>,
  frameworks: Framework[]
): Partial<Record<Framework, V>> {
  return Object.fromEntries(
    frameworks
      .filter((framework) => variants[framework])
      .map((framework) => [framework, variants[framework]])
  );
}

// Two returns, so each keeps its own variant type.
function releaseItem(item: CatalogItem, frameworks: Framework[]): CatalogItem {
  if (item.kind === 'setup') {
    return { ...item, variants: installedVariants(item.variants, frameworks) };
  }
  return { ...item, variants: installedVariants(item.variants, frameworks) };
}

function applyEdits(content: string, edits: Edit[]) {
  return edits.reduceRight(
    (text, [start, end, replacement]) =>
      text.slice(0, start) + replacement + text.slice(end),
    content
  );
}

/** `npm` with `library`'s packages in place of `fallback`'s. */
function iconPackages(
  npm: Record<string, string>,
  library: IconLibrary,
  fallback: IconLibrary
) {
  const others = Object.entries(npm).filter(([pkg]) => !(pkg in fallback.npm));
  return { ...Object.fromEntries(others), ...library.npm };
}

/** `stories` with each file's icons drawn by `library`. */
function storiesWithIconLibrary(
  stories: Stories,
  library: IconLibrary,
  fallback: IconLibrary
): Stories {
  const drawn = ({ path, content, icons }: StoryFile): StoryFile => ({
    path,
    content: applyEdits(content, icons?.[library.name] ?? []),
  });
  const { npm } = stories.packages;
  const importsIcons = Object.keys(npm).some((pkg) => pkg in fallback.npm);
  return {
    ...stories,
    packages: {
      npm: importsIcons ? iconPackages(npm, library, fallback) : npm,
    },
    files: stories.files.map(drawn),
    ...(stories.react18 && {
      react18: { files: stories.react18.files.map(drawn) },
    }),
  };
}

/**
 * `variant` with `library`'s `lib/icons.ts` and packages in place of
 * `fallback`'s, and its stories' icons drawn by `library`.
 */
function withIconLibrary<V extends Variant>(
  variant: V,
  library: IconLibrary,
  fallback: IconLibrary
): V {
  const stories = variant.stories && {
    stories: storiesWithIconLibrary(variant.stories, library, fallback),
  };
  if (!variant.files.some((file) => file.path === library.file.path)) {
    return { ...variant, ...stories };
  }
  return {
    ...variant,
    ...stories,
    files: variant.files.map((file) =>
      file.path === library.file.path ? library.file : file
    ),
    packages: {
      ...variant.packages,
      npm: iconPackages(variant.packages.npm, library, fallback),
    },
  };
}

/** `item` with `library`'s `lib/icons.ts`. Setup never carries the file. */
function itemWithIconLibrary(
  item: CatalogItem,
  library: IconLibrary,
  fallback: IconLibrary
): CatalogItem {
  if (item.kind === 'setup') return item;
  const { react } = item.variants;
  if (!react) return item;
  return {
    ...item,
    variants: {
      ...item.variants,
      react: withIconLibrary(react, library, fallback),
    },
  };
}

/**
 * `catalog` with every React `lib/icons.ts` drawn by the icon library `name`:
 * each item that carries the file gets that library's copy and packages in
 * place of the default library's.
 */
export function catalogWithIconLibrary(
  catalog: Catalog,
  name: string
): Catalog {
  const [fallback] = catalog.iconLibraries;
  const library = catalog.iconLibraries.find((entry) => entry.name === name);
  if (!fallback || !library || library === fallback) return catalog;
  return {
    ...catalog,
    items: catalog.items.map((item) =>
      itemWithIconLibrary(item, library, fallback)
    ),
  };
}

/**
 * `variant` with its stories among its own files, items and packages. A story
 * imports its types from `framework.to` in place of `framework.from`.
 */
function withStories<V extends Variant>(
  variant: V,
  framework: { from: string; to: string }
): V {
  const { stories } = variant;
  if (!stories) return variant;
  const plain = ({ path, content }: StoryFile): CatalogFile => ({
    path,
    content: content.replaceAll(`'${framework.from}'`, `'${framework.to}'`),
  });
  const react18Files = [
    ...(variant.react18?.files ?? []),
    ...(stories.react18?.files ?? []).map(plain),
  ];
  return {
    ...variant,
    stories: undefined,
    items: [...new Set([...variant.items, ...stories.items])],
    packages: {
      ...variant.packages,
      npm: { ...stories.packages.npm, ...variant.packages.npm },
    },
    files: [...variant.files, ...stories.files.map(plain)],
    ...(react18Files.length > 0 && {
      react18: {
        files: react18Files,
        packages: variant.react18?.packages ?? { npm: {} },
      },
    }),
  };
}

// Two returns, so each keeps its own variant type.
function itemWithStories(
  item: CatalogItem,
  framework: { from: string; to: string }
): CatalogItem {
  const fold = <V extends Variant>(variants: Partial<Record<Framework, V>>) =>
    Object.fromEntries(
      Object.entries(variants).map(([name, variant]) => [
        name,
        withStories(variant, framework),
      ])
    ) as Partial<Record<Framework, V>>;
  if (item.kind === 'setup') return { ...item, variants: fold(item.variants) };
  return { ...item, variants: fold(item.variants) };
}

/**
 * `catalog` as an app with stories installs it: each variant's stories are
 * among its files, and import their types from the Storybook framework package
 * `framework`. Call it after `catalogWithIconLibrary`, which draws the stories'
 * icons.
 */
export function catalogWithStories(
  catalog: Catalog,
  framework: string
): Catalog {
  const [written] = catalog.storybook?.frameworks ?? [];
  if (!written) return catalog;
  return {
    ...catalog,
    items: catalog.items.map((item) =>
      itemWithStories(item, { from: written, to: framework })
    ),
  };
}

/** `catalog` with only the variants the CLI installs: what a release publishes. */
export function releaseCatalog(catalog: Catalog): Catalog {
  return {
    ...catalog,
    items: catalog.items.map((item) => releaseItem(item, catalog.frameworks)),
  };
}
