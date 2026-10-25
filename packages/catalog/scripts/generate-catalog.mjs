// @ts-check
/**
 * Writes `generated/catalog.json`: every item `nxds-cli` installs,
 * with each item's files, packages and the other items it needs.
 *
 * Items are framework-neutral; each carries one variant per framework that
 * has it. A Vue variant exists for setup and for each component @nxds/vue
 * exports.
 */
import {
  componentDescription,
  componentStoryFiles,
} from '@nxds/source-model/docs-stories.ts';
import {
  importSpecifiers,
  readCanonical,
  writeJson,
} from '@nxds/source-model/files.mjs';
import { pascal } from '@nxds/source-model/humanize.ts';
import {
  blockSources,
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import {
  react18Root,
  react18Src,
  reactRoot,
  reactSrc,
  repoRoot,
  toRepoPath,
  vueSrc,
} from '@nxds/source-model/roots.mjs';
import { exportedSlugs } from '@nxds/source-model/vue-sources.ts';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Core's source, not its build: the release job snapshots a catalog before
// anything is built.
import { FONT_OPTIONS } from '../../core/src/lib/font-options.ts';
import {
  DEFAULT_ICON_LIBRARY,
  ICON_LIBRARY_OPTIONS,
} from '../../core/src/lib/icon-libraries.ts';
import { catalogSchema, issueLines } from './catalog-schema.ts';
import {
  dependencyEntries,
  react,
  vue,
  vueWalks,
} from './dependency-plans.mjs';
import { packageName } from './install-plans.ts';
import { CATALOG_FILE } from './roots.mjs';

/**
 * @typedef {import('./catalog-schema').Catalog} Catalog
 * @typedef {import('./catalog-schema').CatalogItem} CatalogItem
 * @typedef {import('./catalog-schema').Variant} Variant
 * @typedef {import('./catalog-schema').SetupItem} SetupItem
 * @typedef {import('./catalog-schema').SetupVariant} SetupVariant
 * @typedef {import('./catalog-schema').IconLibrary} IconLibrary
 * @typedef {import('./catalog-schema').Font} Font
 */

const DOCS_URL = 'https://nxds.dev';
const SETUP = 'setup';
const TAILWIND_DIR = path.join(repoRoot, 'packages', 'tailwind');
const ICONS_FILE = 'lib/icons.ts';

/**
 * What each framework's setup copies and installs: the appearance provider and
 * `cn`, which every app needs before any component, and the packages the
 * framework's CSS entry imports.
 * @type {Record<'react' | 'vue', { roots: string[]; packages: string[]; steps: import('./catalog-schema').SetupStep[] }>}
 */
const SETUP_SOURCES = {
  react: {
    roots: [
      'components/appearance/provider/index.ts',
      'components/appearance/provider/server.ts',
      'lib/utils.ts',
    ],
    packages: ['tw-animate-css'],
    steps: ['add-css-import', 'add-head-script', 'wrap-root-with-provider'],
  },
  vue: {
    roots: ['components/appearance/index.ts', 'lib/utils.ts'],
    packages: [],
    steps: [],
  },
};

/** Vue's appearance folder is its provider, which setup brings. */
const VUE_SETUP_SLUG = 'appearance';

/** Each framework's install planner and the source tree its paths are relative to. */
const FRAMEWORKS = {
  react: { planner: react, src: reactSrc },
  vue: { planner: vue, src: vueSrc },
};

/**
 * @param {string} src
 * @param {string} srcPath
 */
function sourceFile(src, srcPath) {
  return { path: srcPath, content: readCanonical(path.join(src, srcPath)) };
}

/** @param {{ name: string; range: string }[]} packages */
function packageRecord(packages) {
  return Object.fromEntries(packages.map(({ name, range }) => [name, range]));
}

/** @type {{ version: string; devDependencies: Record<string, string>; peerDependencies: Record<string, string> }} */
const reactPackage = JSON.parse(
  readFileSync(path.join(reactRoot, 'package.json'), 'utf8')
);
const devRanges = reactPackage.devDependencies;
/** @type {{ peerDependencies: Record<string, string> }} */
const react18Package = JSON.parse(
  readFileSync(path.join(react18Root, 'package.json'), 'utf8')
);

/**
 * `variant` with what an app on React 18 installs instead: packages/react-18's
 * copy of each file that differs. Recharts reads elements with react-is, which
 * must match the app's React, so a variant with recharts pins it per major.
 * @template {Variant} V
 * @param {V} variant
 * @returns {V}
 */
function withReact18(variant) {
  const files = variant.files.flatMap((file) => {
    if (!existsSync(path.join(reactSrc, file.path))) return [];
    const copy = path.join(react18Src, file.path);
    if (!existsSync(copy)) {
      throw new Error(
        `catalog: ${toRepoPath(copy)} is missing. Run \`pnpm --filter @nxds/react-18 generate\`.`
      );
    }
    const content = readCanonical(copy);
    return content === file.content ? [] : [{ path: file.path, content }];
  });
  const usesRecharts = 'recharts' in variant.packages.npm;
  const npm = usesRecharts
    ? {
        ...variant.packages.npm,
        'react-is': reactPackage.peerDependencies.react,
      }
    : variant.packages.npm;
  const react18Npm = usesRecharts
    ? { 'react-is': react18Package.peerDependencies.react }
    : {};
  if (files.length === 0 && !usesRecharts) return variant;
  return {
    ...variant,
    packages: { ...variant.packages, npm },
    react18: { files, packages: { npm: react18Npm } },
  };
}

/**
 * React's `lib/icons.ts` drawn by each icon library, the default first. The
 * default draws `lib/icons.ts` itself; the others are in `lib/icon-libraries/`.
 * @returns {IconLibrary[]}
 */
function iconLibraries() {
  const libraries = [
    ...ICON_LIBRARY_OPTIONS.filter(
      ({ value }) => value === DEFAULT_ICON_LIBRARY
    ),
    ...ICON_LIBRARY_OPTIONS.filter(
      ({ value }) => value !== DEFAULT_ICON_LIBRARY
    ),
  ];
  return libraries.map(({ value, label }) => {
    const source =
      value === DEFAULT_ICON_LIBRARY
        ? ICONS_FILE
        : `lib/icon-libraries/${value}.ts`;
    const walked = react.walkRoots(value, [path.join(reactSrc, source)]);
    return {
      name: value,
      label,
      file: {
        path: ICONS_FILE,
        content: readCanonical(path.join(reactSrc, source)),
      },
      npm: packageRecord(walked.packages.map(react.toInstall)),
    };
  });
}

/**
 * Fails when a React file other than `lib/icons.ts` imports an icon library,
 * since `nxds init --icons` swaps only that file.
 * @param {CatalogItem[]} items
 * @param {IconLibrary[]} libraries
 */
function assertIconsOnlyInIconsFile(items, libraries) {
  const iconPackages = new Set(
    libraries.flatMap((library) => Object.keys(library.npm))
  );
  for (const item of items) {
    for (const file of item.variants.react?.files ?? []) {
      if (file.path === ICONS_FILE || !/\.tsx?$/.test(file.path)) continue;
      const imported = importSpecifiers(file.content).find((specifier) =>
        iconPackages.has(packageName(specifier))
      );
      if (imported) {
        throw new Error(
          `catalog: ${file.path} imports ${imported}. Import nxds's own icons from ${ICONS_FILE}, the one file \`nxds init --icons\` swaps.`
        );
      }
    }
  }
}

/** @type {{ dependencies: Record<string, string> }} */
const docsPackage = JSON.parse(
  readFileSync(path.join(repoRoot, 'apps', 'docs', 'package.json'), 'utf8')
);

/**
 * Each font option, at the range the docs app, which self-hosts every one,
 * depends on.
 * @returns {Font[]}
 */
function fonts() {
  return FONT_OPTIONS.map(
    ({ value, label, category, family, package: name }) => {
      const range = docsPackage.dependencies[name];
      if (!range) {
        throw new Error(
          `catalog: the docs app self-hosts every font option, so apps/docs must depend on ${name}.`
        );
      }
      return { name: value, label, category, family, package: name, range };
    }
  );
}

/** Tailwind 4 at the version packages/react builds with, or a newer 4.x. */
function tailwindRange() {
  const version = devRanges.tailwindcss;
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `packages/react pins tailwindcss to an exact version; found "${version}".`
    );
  }
  return `^${version}`;
}

/** The token CSS every framework's setup copies into `tailwind/`. */
function tokenCss() {
  return readdirSync(TAILWIND_DIR)
    .filter((name) => name.endsWith('.css'))
    .sort()
    .map((name) => ({
      path: `tailwind/${name}`,
      content: readCanonical(path.join(TAILWIND_DIR, name)),
    }));
}

/**
 * @param {keyof typeof FRAMEWORKS} framework
 * @returns {SetupVariant}
 */
function setupVariant(framework) {
  const { planner, src } = FRAMEWORKS[framework];
  const { roots, packages, steps } = SETUP_SOURCES[framework];
  const walked = planner.walkRoots(
    SETUP,
    roots.map((file) => path.join(src, file))
  );
  return {
    items: [],
    packages: {
      npm: {
        ...packageRecord(walked.packages.map(planner.toInstall)),
        ...Object.fromEntries(packages.map((name) => [name, devRanges[name]])),
      },
      tailwind: tailwindRange(),
    },
    files: [
      ...tokenCss(),
      ...walked.files
        .map(planner.toSrcPath)
        .sort()
        .map((file) => sourceFile(src, file)),
    ],
    css: [],
    steps,
  };
}

/** @returns {SetupItem & { variants: { react: SetupVariant; vue: SetupVariant } }} */
function setupItem() {
  return {
    name: SETUP,
    kind: 'setup',
    title: 'Setup',
    description:
      'The token CSS, the appearance provider and the cn helper. Every other item needs it.',
    docs: `${DOCS_URL}/getting-started/install`,
    variants: {
      react: withReact18(setupVariant('react')),
      vue: setupVariant('vue'),
    },
  };
}

/**
 * A component or block variant: what its docs plan lists, minus what setup
 * already brings.
 * @param {string} src
 * @param {{ components: string[]; install: { name: string; range: string }[]; files: string[]; styles: string[] }} plan
 * @param {Variant} setup
 * @returns {Variant}
 */
function planVariant(src, plan, setup) {
  const setupFiles = new Set(setup.files.map((file) => file.path));
  return {
    items: [SETUP, ...plan.components],
    packages: {
      npm: packageRecord(
        plan.install.filter(({ name }) => !(name in setup.packages.npm))
      ),
    },
    files: plan.files
      .filter((file) => !setupFiles.has(file))
      .map((file) => sourceFile(src, file)),
    css: plan.styles,
    steps: [],
  };
}

/**
 * Each Vue component's variant, by slug. Vue's appearance folder is left out:
 * it is the provider, which the Vue setup variant brings.
 * @param {SetupVariant} setup
 * @returns {Map<string, Variant>}
 */
function vueVariants(setup) {
  const slugs = exportedSlugs().filter((slug) => slug !== VUE_SETUP_SLUG);
  const closures = vueWalks(slugs);
  const exported = new Set(slugs);
  return new Map(
    [...closures.values()].map((walked) => [
      walked.name,
      planVariant(
        vueSrc,
        vue.componentEntry(walked, closures, exported).plan,
        setup
      ),
    ])
  );
}

/** @returns {Catalog} */
export function buildCatalog() {
  const setup = setupItem();
  const entries = dependencyEntries();
  const vueComponents = vueVariants(setup.variants.vue);

  const exported = exportedComponentSlugs();
  for (const slug of vueComponents.keys()) {
    if (!exported.has(slug)) {
      throw new Error(
        `catalog: @nxds/vue exports ${slug}, which @nxds/react doesn't, so it has no catalog item.`
      );
    }
  }

  /** @type {CatalogItem[]} */
  const components = entries.components
    .filter(({ slug }) => exported.has(slug))
    .map(({ slug, plan }) => {
      const vueVariant = vueComponents.get(slug);
      return {
        name: slug,
        kind: 'component',
        title: componentLabel(slug),
        description: componentDescription(
          slug,
          componentStoryFiles(slug)
        ).trim(),
        docs: `${DOCS_URL}/components/${slug}`,
        variants: {
          react: withReact18(planVariant(reactSrc, plan, setup.variants.react)),
          ...(vueVariant && { vue: vueVariant }),
        },
      };
    });

  const blockPlans = new Map(
    entries.blocks.map(({ slug, plan }) => [slug, plan])
  );
  /** @type {CatalogItem[]} */
  const blocks = blockSources().map((block) => ({
    name: block.slug,
    kind: 'block',
    title: pascal(block.slug),
    description: componentDescription(block.slug, [block.stories]).trim(),
    docs: `${DOCS_URL}/blocks/${block.slug}`,
    variants: {
      react: withReact18(
        planVariant(reactSrc, blockPlans.get(block.slug), setup.variants.react)
      ),
    },
  }));

  const items = [setup, ...components, ...blocks];
  const libraries = iconLibraries();
  assertIconsOnlyInIconsFile(items, libraries);

  /** @type {Catalog} */
  const catalog = {
    schema: 1,
    version: reactPackage.version,
    frameworks: ['react'],
    reactMajors: [18, 19],
    items,
    iconLibraries: libraries,
    fonts: fonts(),
  };
  // Checked, not parsed: parsing would reorder keys in the written JSON.
  const checked = catalogSchema.safeParse(catalog);
  if (!checked.success) {
    throw new Error(
      `catalog: the built catalog doesn't match catalog-schema.ts:\n${issueLines(checked.error).join('\n')}`
    );
  }
  return catalog;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const catalog = buildCatalog();
  writeJson(CATALOG_FILE, catalog);
  console.log(
    `catalog: ${catalog.items.length} items, version ${catalog.version} -> ${toRepoPath(CATALOG_FILE)}`
  );
}
