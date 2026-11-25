import {
  type ArrayExpression,
  type CallExpression,
  isArrayExpression,
  isCallExpression,
  isExportDefaultDeclaration,
  isIdentifier,
  isJSXElement,
  isMemberExpression,
  isObjectExpression,
  isObjectProperty,
  isSpreadElement,
  type JSXElement,
  type ObjectExpression,
  type Program,
} from '@babel/types';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import type { Font, SetupStep } from '../catalog';
import {
  COLORS_FILE,
  COLORS_IMPORT,
  DERIVE_COLORS_OFF,
  DERIVE_COLORS_OFF_OPTION,
  importsColors,
} from '../colors';
import type { Config } from '../config';
import { CliError } from '../errors';
import { relativeImport } from '../files';
import {
  APP_DIRS,
  findFile,
  type Project,
  type Setup,
  VITE_CONFIGS,
  VITE_ENTRIES,
} from '../project';
import { fontImportLine } from '../theme';

import {
  applyInsertions,
  attributeInsertion,
  beforeWhitespace,
  endOf,
  findJsx,
  findNode,
  hasAttribute,
  hasFalseAttribute,
  importInsertion,
  type Insertion,
  lineIndent,
  openingTagEnd,
  parseModule,
  startOf,
} from './source-edit';

const STORAGE_KEY = 'nxds-appearance';
const PROVIDER = 'components/appearance/provider';

const TAILWIND_PLUGIN: Record<Setup, string> = {
  'next-app': '@tailwindcss/postcss',
  'vite-react': '@tailwindcss/vite',
};

/** Tailwind and the setup's build plugin, which ship together at one version. */
export function tailwindPackages(setup: Setup, range: string) {
  return { tailwindcss: range, [TAILWIND_PLUGIN[setup]]: range };
}

/** A file `init` writes or edits, relative to the project root. */
export type FileChange = { path: string; content: string; created: boolean };

/** A step `init` could not do itself. */
export type ManualStep = { file: string; step: string };

export type WiringPlan = { changes: FileChange[]; manual: ManualStep[] };

function appDir(project: Project) {
  const dir = APP_DIRS.find((candidate) =>
    existsSync(path.join(project.root, candidate, 'layout.tsx'))
  );
  if (!dir)
    throw new CliError('No app/layout.tsx or src/app/layout.tsx found.');
  return dir;
}

/** Where the nxds CSS entry and `appearance-state.ts` live. */
export function entryDir(project: Project) {
  return project.setup === 'next-app' ? appDir(project) : 'src';
}

export function defaultDir(project: Project) {
  return project.usesSrc ? 'src/components/nxds' : 'components/nxds';
}

export function cssEntryPath(project: Project) {
  return `${entryDir(project)}/nxds.css`;
}

function read(project: Project, file: string) {
  return readFileSync(path.join(project.root, file), 'utf8');
}

/**
 * The nxds CSS entry: nxds's own Tailwind build, beside the app's. An app
 * without Tailwind has no reset yet, so the entry brings Preflight.
 */
export function cssEntry(
  config: Config,
  withPreflight: boolean,
  fonts: Font[],
  ownColors: boolean
) {
  const tokens = relativeImport(config.css, `${config.dir}/tailwind/nxds.css`);
  return [
    ...(withPreflight
      ? [
          '@layer theme, base, components, utilities;',
          "@import 'tailwindcss/preflight.css' layer(base);",
        ]
      : []),
    `@import '${tokens}';`,
    "@import 'tw-animate-css';",
    ...fonts.map(fontImportLine),
    ...(ownColors ? [COLORS_IMPORT] : []),
    '',
  ].join('\n');
}

/** The `@import` line `add` appends for a component stylesheet. */
export function cssImportLine(config: Config, file: string) {
  return `@import '${relativeImport(config.css, `${config.dir}/${file}`)}';`;
}

/** `appearance-state.ts`: the app's default appearance, nxds-theme.ts's theme. */
const APPEARANCE_STATE = `import type { NxdsAppearanceState } from '@nxds/core';

import { nxdsTheme } from './nxds-theme';

export const defaultAppearance = {
  ...nxdsTheme,
} satisfies NxdsAppearanceState;
`;

function providerImport(fromFile: string, config: Config, file = '') {
  return relativeImport(fromFile, `${config.dir}/${PROVIDER}${file}`);
}

function editedFile(file: string, content: string): FileChange {
  return { path: file, content, created: false };
}

const NO_CHANGES: WiringPlan = { changes: [], manual: [] };

type Steps = ReadonlySet<SetupStep>;

/** The props the provider and the head script share. */
function providerProps(ownColors: boolean) {
  const props = `storageKey="${STORAGE_KEY}" defaultState={defaultAppearance}`;
  return ownColors ? `${props} ${DERIVE_COLORS_OFF}` : props;
}

/** The elements that take `deriveColors`: the provider and the head script. */
const APPEARANCE_ELEMENTS = ['NxdsAppearanceProvider', 'NxdsAppearanceScript'];

/**
 * Whether a wired file renders the provider or the head script without
 * `deriveColors={false}`. Color derivation is then on, which overrides an
 * app's own colors.
 */
export function rendersDerivedColors(source: string, file: string) {
  const program = parseModule(source, file);
  return APPEARANCE_ELEMENTS.some((name) => {
    const element = findJsx(program, name);
    return element !== undefined && !hasFalseAttribute(element, 'deriveColors');
  });
}

/**
 * Adds `deriveColors={false}` to each of `names` a wired file renders. One it
 * doesn't render, such as a provider in a file of its own, is a manual step.
 * So is one that sets `deriveColors` to something else.
 */
function turnDerivationOff(
  source: string,
  file: string,
  names: string[]
): WiringPlan {
  const program = parseModule(source, file);
  const insertions: Insertion[] = [];
  const manual: ManualStep[] = [];
  for (const name of names) {
    const element = findJsx(program, name);
    if (!element) {
      manual.push({ file, step: `Pass ${DERIVE_COLORS_OFF} to ${name}.` });
      continue;
    }
    if (hasFalseAttribute(element, 'deriveColors')) continue;
    if (hasAttribute(element, 'deriveColors')) {
      manual.push({
        file,
        step: `Change deriveColors to ${DERIVE_COLORS_OFF} on ${name}.`,
      });
      continue;
    }
    insertions.push(attributeInsertion(element, DERIVE_COLORS_OFF));
  }
  return {
    changes:
      insertions.length > 0
        ? [editedFile(file, applyInsertions(source, insertions))]
        : [],
    manual,
  };
}

function wireNextLayout(
  project: Project,
  config: Config,
  steps: Steps,
  ownColors: boolean
): WiringPlan {
  const layout = `${appDir(project)}/layout.tsx`;
  const source = read(project, layout);
  if (/NxdsAppearance(Provider|Script)/.test(source)) {
    return ownColors
      ? turnDerivationOff(source, layout, APPEARANCE_ELEMENTS)
      : NO_CHANGES;
  }
  const props = providerProps(ownColors);
  const scriptElement = `<NxdsAppearanceScript ${props} />`;

  const program = parseModule(source, layout);
  const html = findJsx(program, 'html');
  const body = html && findJsx(html, 'body');
  const head = html && findJsx(html, 'head');
  if (!html || !body?.closingElement || (head && !head.closingElement)) {
    return {
      changes: [],
      manual: [
        {
          file: layout,
          step: `Add ${scriptElement} inside <head>, and wrap the content of <body> in <NxdsAppearanceProvider ${props}>.`,
        },
      ],
    };
  }

  const step = '  ';
  const imports: string[] = [];
  const insertions: Insertion[] = [];
  if (steps.has('add-css-import')) imports.push("import './nxds.css';");
  if (steps.has('wrap-root-with-provider')) {
    const bodyIndent = lineIndent(source, startOf(body));
    imports.push(
      `import { NxdsAppearanceProvider } from '${providerImport(layout, config)}';`
    );
    insertions.push(
      {
        at: openingTagEnd(body),
        text: `\n${bodyIndent}${step}<NxdsAppearanceProvider ${props}>`,
      },
      {
        at: beforeWhitespace(source, startOf(body.closingElement)),
        text: `\n${bodyIndent}${step}</NxdsAppearanceProvider>`,
      }
    );
  }
  if (steps.has('add-head-script')) {
    const htmlIndent = lineIndent(source, startOf(html));
    imports.push(
      `import { NxdsAppearanceScript } from '${providerImport(layout, config, '/server')}';`
    );
    insertions.push(
      head
        ? {
            at: openingTagEnd(head),
            text: `\n${lineIndent(source, startOf(head))}${step}${scriptElement}`,
          }
        : {
            at: openingTagEnd(html),
            text: `\n${htmlIndent}${step}<head>\n${htmlIndent}${step}${step}${scriptElement}\n${htmlIndent}${step}</head>`,
          }
    );
    if (!hasAttribute(html, 'suppressHydrationWarning')) {
      insertions.push(attributeInsertion(html, 'suppressHydrationWarning'));
    }
  }
  if (insertions.length > 0) {
    imports.push("import { defaultAppearance } from './appearance-state';");
  }
  if (imports.length === 0) return NO_CHANGES;

  insertions.push(importInsertion(source, program, imports));
  return {
    changes: [editedFile(layout, applyInsertions(source, insertions))],
    manual: [],
  };
}

/** The `render(<App />)` element in a Vite entry. */
function renderedElement(program: Program) {
  const call = findNode(
    program,
    (node): node is CallExpression =>
      isCallExpression(node) &&
      isMemberExpression(node.callee) &&
      isIdentifier(node.callee.property, { name: 'render' }) &&
      isJSXElement(node.arguments[0])
  );
  return call?.arguments[0] as JSXElement | undefined;
}

function wireViteEntry(
  project: Project,
  config: Config,
  steps: Steps,
  ownColors: boolean
): WiringPlan {
  const entry = findFile(project, VITE_ENTRIES);
  if (!entry) throw new CliError('No src/main.tsx found.');
  const source = read(project, entry);
  if (source.includes('NxdsAppearanceProvider')) {
    return ownColors
      ? turnDerivationOff(source, entry, ['NxdsAppearanceProvider'])
      : NO_CHANGES;
  }
  const props = providerProps(ownColors);

  const program = parseModule(source, entry);
  const imports: string[] = [];
  const insertions: Insertion[] = [];
  if (steps.has('add-css-import')) imports.push("import './nxds.css';");
  if (steps.has('wrap-root-with-provider')) {
    const app = renderedElement(program);
    if (!app) {
      return {
        changes: [],
        manual: [
          {
            file: entry,
            step: `Wrap the element you render in <NxdsAppearanceProvider ${props}>.`,
          },
        ],
      };
    }
    const indent = lineIndent(source, startOf(app));
    imports.push(
      `import { NxdsAppearanceProvider } from '${providerImport(entry, config)}';`,
      "import { defaultAppearance } from './appearance-state';"
    );
    insertions.push(
      {
        at: startOf(app),
        text: `<NxdsAppearanceProvider ${props}>\n${indent}`,
      },
      { at: endOf(app), text: `\n${indent}</NxdsAppearanceProvider>` }
    );
  }
  if (imports.length === 0) return NO_CHANGES;

  insertions.push(importInsertion(source, program, imports));
  return {
    changes: [editedFile(entry, applyInsertions(source, insertions))],
    manual: [],
  };
}

export const VITE_PLUGIN_FILE = 'nxds.vite.ts';
const DERIVED_SNAPSHOT =
  'createNxdsAppearanceSnapshotFromState(defaultAppearance)';
const OWN_COLORS_SNAPSHOT = `createNxdsAppearanceSnapshotFromState(defaultAppearance, {
      ${DERIVE_COLORS_OFF_OPTION},
    })`;

function vitePlugin(ownColors: boolean) {
  return `import {
  createNxdsAppearanceBootstrapScript,
  createNxdsAppearanceSnapshotFromState,
} from '@nxds/core';
import type { Plugin } from 'vite';

import { defaultAppearance } from './src/appearance-state';

/** Adds the nxds theme script to index.html, so the page doesn't flash the wrong theme. */
export function nxdsAppearance(): Plugin {
  const script = createNxdsAppearanceBootstrapScript({
    storageKey: '${STORAGE_KEY}',
    defaultSnapshot: ${ownColors ? OWN_COLORS_SNAPSHOT : DERIVED_SNAPSHOT},
  });
  return {
    name: 'nxds-appearance',
    transformIndexHtml: (html) =>
      html.replace('</head>', \`<script>\${script}</script></head>\`),
  };
}
`;
}

/**
 * The theme script file. `init` writes it once. For an app's own colors it
 * also turns derivation off in the one it wrote earlier, and one the app
 * rewrote is a manual step.
 */
function planViteScript(
  project: Project,
  steps: Steps,
  ownColors: boolean
): WiringPlan {
  if (!existsSync(path.join(project.root, VITE_PLUGIN_FILE))) {
    if (!steps.has('add-head-script')) return NO_CHANGES;
    return {
      changes: [
        {
          path: VITE_PLUGIN_FILE,
          content: vitePlugin(ownColors),
          created: true,
        },
      ],
      manual: [],
    };
  }
  if (!ownColors) return NO_CHANGES;

  const source = read(project, VITE_PLUGIN_FILE);
  if (source.includes(DERIVE_COLORS_OFF_OPTION)) return NO_CHANGES;
  if (!source.includes(DERIVED_SNAPSHOT)) {
    return {
      changes: [],
      manual: [
        {
          file: VITE_PLUGIN_FILE,
          step: `Pass { ${DERIVE_COLORS_OFF_OPTION} } as the second argument of createNxdsAppearanceSnapshotFromState.`,
        },
      ],
    };
  }
  return {
    changes: [
      editedFile(
        VITE_PLUGIN_FILE,
        source.replace(DERIVED_SNAPSHOT, OWN_COLORS_SNAPSHOT)
      ),
    ],
    manual: [],
  };
}

/** The object a Vite config exports, directly or through `defineConfig(...)`. */
function configObject(program: Program): ObjectExpression | undefined {
  const declaration = program.body.find((node) =>
    isExportDefaultDeclaration(node)
  )?.declaration;
  if (isObjectExpression(declaration)) return declaration;
  if (!isCallExpression(declaration)) return undefined;
  const [argument] = declaration.arguments;
  return isObjectExpression(argument) ? argument : undefined;
}

function hasProperty(object: ObjectExpression, name: string) {
  return object.properties.some(
    (property) =>
      !isSpreadElement(property) && isIdentifier(property.key, { name })
  );
}

/** The config's own `plugins: [...]`, not one nested deeper (`build.rollupOptions.plugins`). */
function pluginsArray(object: ObjectExpression): ArrayExpression | undefined {
  const property = object.properties.find(
    (candidate) =>
      isObjectProperty(candidate) &&
      isIdentifier(candidate.key, { name: 'plugins' })
  );
  return isObjectProperty(property) && isArrayExpression(property.value)
    ? property.value
    : undefined;
}

type VitePlugin = { call: string; importLine: string };

const TAILWIND_VITE_PLUGIN: VitePlugin = {
  call: 'tailwindcss()',
  importLine: "import tailwindcss from '@tailwindcss/vite';",
};

const NXDS_VITE_PLUGIN: VitePlugin = {
  call: 'nxdsAppearance()',
  importLine: "import { nxdsAppearance } from './nxds.vite';",
};

// Vite resolves a path that starts with `/` from the project root.
const VITE_ALIAS = "{ '@': '/src' }";

/**
 * Adds the theme-script plugin, Tailwind's plugin when the app had no
 * Tailwind, and the `@` → `src` alias the docs examples import through.
 */
function wireViteConfig(
  project: Project,
  addTailwind: boolean,
  steps: Steps,
  ownColors: boolean
): WiringPlan {
  const configFile = findFile(project, VITE_CONFIGS) ?? 'vite.config.ts';
  const script = planViteScript(project, steps, ownColors);
  const changes: FileChange[] = [...script.changes];
  const source = existsSync(path.join(project.root, configFile))
    ? read(project, configFile)
    : '';
  const program = source ? parseModule(source, configFile) : undefined;
  const object = program && configObject(program);
  const plugins = object && pluginsArray(object);

  const newPlugins: VitePlugin[] = [
    ...(addTailwind ? [TAILWIND_VITE_PLUGIN] : []),
    ...(steps.has('add-head-script') && !source.includes('nxdsAppearance')
      ? [NXDS_VITE_PLUGIN]
      : []),
  ];
  const needsAlias = !/['"]@['"]/.test(source);
  const manual: ManualStep[] = [...script.manual];
  const insertions: Insertion[] = [];
  const imports: string[] = [];

  if (newPlugins.length > 0 && plugins) {
    const calls = newPlugins.map((plugin) => plugin.call).join(', ');
    const last = plugins.elements.at(-1);
    insertions.push(
      last
        ? { at: endOf(last), text: `, ${calls}` }
        : { at: startOf(plugins) + 1, text: calls }
    );
    imports.push(...newPlugins.map((plugin) => plugin.importLine));
  } else if (newPlugins.length > 0) {
    manual.push({
      file: configFile,
      step: `Add ${newPlugins.map((plugin) => `${plugin.call} (${plugin.importLine})`).join(' and ')} to the plugins array.`,
    });
  }

  if (needsAlias && object && !hasProperty(object, 'resolve')) {
    const last = object.properties.at(-1);
    const alias = `resolve: {\n    alias: ${VITE_ALIAS},\n  }`;
    insertions.push(
      last
        ? { at: endOf(last), text: `,\n  ${alias}` }
        : { at: startOf(object) + 1, text: `\n  ${alias},\n` }
    );
  } else if (needsAlias) {
    manual.push({
      file: configFile,
      step: `Add resolve.alias ${VITE_ALIAS}, so imports like @/components/nxds/... resolve.`,
    });
  }

  if (program && insertions.length > 0) {
    insertions.push(importInsertion(source, program, imports));
    changes.push(editedFile(configFile, applyInsertions(source, insertions)));
  }
  return { changes, manual };
}

const ALIAS_PATTERN = /"@\/\*"/;
const PATHS_PATTERN = /"paths"\s*:/;
const COMPILER_OPTIONS = /"compilerOptions"\s*:\s*\{/;

/** Adds `"@/*"` to the tsconfig that type-checks the app, unless it has one. */
function wireTsconfigAlias(project: Project): WiringPlan {
  const file = findFile(project, ['tsconfig.app.json', 'tsconfig.json']);
  if (!file) throw new CliError('No tsconfig.json found.');
  const source = read(project, file);
  if (ALIAS_PATTERN.test(source)) return NO_CHANGES;

  const target = project.usesSrc ? './src/*' : './*';
  const match = COMPILER_OPTIONS.exec(source);
  if (!match || PATHS_PATTERN.test(source)) {
    return {
      changes: [],
      manual: [
        {
          file,
          step: `Add "@/*": ["${target}"] to compilerOptions.paths.`,
        },
      ],
    };
  }
  const at = match.index + match[0].length;
  return {
    changes: [
      editedFile(
        file,
        applyInsertions(source, [
          { at, text: `\n    "paths": { "@/*": ["${target}"] },` },
        ])
      ),
    ],
    manual: [],
  };
}

const ESLINT_CONFIGS = [
  'eslint.config.js',
  'eslint.config.mjs',
  'eslint.config.ts',
];

/** The config objects an ESLint flat config exports, as written. */
function exportedConfigs(program: Program) {
  const declaration = program.body.find((node) =>
    isExportDefaultDeclaration(node)
  )?.declaration;
  if (isArrayExpression(declaration)) return declaration.elements;
  if (!isCallExpression(declaration)) return [];
  const [first] = declaration.arguments;
  return isArrayExpression(first) ? first.elements : declaration.arguments;
}

/**
 * Vite's template lints with react-refresh, which flags nxds files that
 * export variants, hooks or contexts beside components. Those files only lose
 * in-place Fast Refresh, so the rule is turned off for the nxds folder.
 */
function wireViteEslint(project: Project, config: Config): WiringPlan {
  const file = findFile(project, ESLINT_CONFIGS);
  if (!file) return NO_CHANGES;
  const source = read(project, file);
  if (!source.includes('react-refresh') || source.includes(config.dir)) {
    return NO_CHANGES;
  }

  const rule = `{\n    files: ['${config.dir}/**/*.{ts,tsx}'],\n    rules: { 'react-refresh/only-export-components': 'off' },\n  }`;
  const last = exportedConfigs(parseModule(source, file)).at(-1);
  if (!last) {
    return {
      changes: [],
      manual: [
        {
          file,
          step: `Add ${rule.replace(/\s+/g, ' ')} to the exported config.`,
        },
      ],
    };
  }
  return {
    changes: [
      editedFile(
        file,
        applyInsertions(source, [{ at: endOf(last), text: `,\n  ${rule}` }])
      ),
    ],
    manual: [],
  };
}

const POSTCSS_CONFIG = `export default {
  plugins: { '@tailwindcss/postcss': {} },
};
`;

export const POSTCSS_CONFIGS = [
  'postcss.config.mjs',
  'postcss.config.js',
  'postcss.config.cjs',
];

function wireNextTailwind(project: Project): WiringPlan {
  const existing = findFile(project, POSTCSS_CONFIGS);
  if (!existing) {
    return {
      changes: [
        { path: 'postcss.config.mjs', content: POSTCSS_CONFIG, created: true },
      ],
      manual: [],
    };
  }
  return {
    changes: [],
    manual: [
      {
        file: existing,
        step: "Add '@tailwindcss/postcss': {} to the plugins.",
      },
    ],
  };
}

function createdUnlessExists(
  project: Project,
  file: string,
  content: string
): WiringPlan {
  if (existsSync(path.join(project.root, file))) return NO_CHANGES;
  return { changes: [{ path: file, content, created: true }], manual: [] };
}

/** The theme `init` sets up: `nxds-theme.ts`, and the fonts it installs. */
export type ThemeSetup = {
  /** `nxds-theme.ts`'s content. */
  source: string;
  fonts: Font[];
  /** Whether the theme sets any part of the appearance. */
  custom: boolean;
};

/**
 * `nxds-theme.ts`, which nxds owns and rewrites, and `appearance-state.ts`,
 * which the app owns. An existing `appearance-state.ts` that doesn't spread the
 * theme yet is a manual step, when there is a theme to spread.
 */
function planTheme(project: Project, theme: ThemeSetup): WiringPlan {
  const dir = entryDir(project);
  const themeFile = `${dir}/nxds-theme.ts`;
  const stateFile = `${dir}/appearance-state.ts`;
  const themeExists = existsSync(path.join(project.root, themeFile));
  const changes: FileChange[] =
    themeExists && read(project, themeFile) === theme.source
      ? []
      : [{ path: themeFile, content: theme.source, created: !themeExists }];
  if (!existsSync(path.join(project.root, stateFile))) {
    changes.push({ path: stateFile, content: APPEARANCE_STATE, created: true });
    return { changes, manual: [] };
  }
  if (!theme.custom || read(project, stateFile).includes("'./nxds-theme'")) {
    return { changes, manual: [] };
  }
  return {
    changes,
    manual: [
      {
        file: stateFile,
        step: "Spread nxdsTheme from './nxds-theme' into defaultAppearance, in place of DEFAULT_NXDS_APPEARANCE, so the app starts from the theme.",
      },
    ],
  };
}

/** Where `nxds-colors.css` lives: beside the nxds CSS entry that imports it. */
export function colorsPath(config: Config) {
  return path.posix.join(path.posix.dirname(config.css), COLORS_FILE);
}

/** Whether the app's CSS entry already loads its own colors file. */
export function ownsColors(project: Project, config: Config) {
  return (
    existsSync(path.join(project.root, config.css)) &&
    importsColors(read(project, config.css))
  );
}

/**
 * The app's own colors: `nxds-colors.css`, written once, and its import in a
 * CSS entry that already exists. An entry `init` is about to create has it.
 */
function planColors(
  project: Project,
  config: Config,
  colors: string
): WiringPlan {
  const plan = createdUnlessExists(project, colorsPath(config), colors);
  if (!existsSync(path.join(project.root, config.css))) return plan;
  const entry = read(project, config.css);
  if (importsColors(entry)) return plan;
  return {
    changes: [
      ...plan.changes,
      editedFile(config.css, `${entry.trimEnd()}\n${COLORS_IMPORT}\n`),
    ],
    manual: [],
  };
}

/**
 * Every file `init` writes or edits, beside the nxds folder itself, for the
 * setup steps the catalog declares. `colors` is `nxds-colors.css`'s content
 * when the app sets its own colors, which also turns color derivation off.
 */
export function planWiring(
  project: Project,
  config: Config,
  addTailwind: boolean,
  setupSteps: SetupStep[],
  theme: ThemeSetup,
  colors: string | null
): WiringPlan {
  const steps: Steps = new Set(setupSteps);
  const ownColors = colors !== null;
  const plans: WiringPlan[] = [wireTsconfigAlias(project)];
  if (steps.has('add-css-import')) {
    plans.push(
      createdUnlessExists(
        project,
        config.css,
        cssEntry(config, addTailwind, theme.fonts, ownColors)
      )
    );
  }
  if (colors !== null) plans.push(planColors(project, config, colors));
  if (steps.has('add-head-script') || steps.has('wrap-root-with-provider')) {
    plans.push(planTheme(project, theme));
  }
  if (project.setup === 'next-app') {
    plans.push(wireNextLayout(project, config, steps, ownColors));
    if (addTailwind) plans.push(wireNextTailwind(project));
  } else {
    plans.push(wireViteEntry(project, config, steps, ownColors));
    plans.push(wireViteConfig(project, addTailwind, steps, ownColors));
    plans.push(wireViteEslint(project, config));
  }

  return {
    changes: plans.flatMap((plan) => plan.changes),
    manual: plans.flatMap((plan) => plan.manual),
  };
}
