import {
  type ArrayExpression,
  type Expression,
  isArrayExpression,
  isCallExpression,
  isExportDefaultDeclaration,
  isIdentifier,
  isObjectExpression,
  isObjectMethod,
  isObjectProperty,
  isSpreadElement,
  isStringLiteral,
  isTSAsExpression,
  isTSSatisfiesExpression,
  isVariableDeclaration,
  type Node,
  type ObjectExpression,
  type ObjectMethod,
  type ObjectProperty,
  type Program,
} from '@babel/types';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import picomatch from 'picomatch';
import { minVersion, satisfies, validRange } from 'semver';

import { type Catalog, storybookFramework } from '../catalog';
import { CLI_COMMAND } from '../cli-command';
import { DERIVE_COLORS_OFF_OPTION } from '../colors';
import type { Config } from '../config';
import { relativeImport } from '../files';
import { installedVersion } from '../packages';
import { findFile, type Project } from '../project';

import {
  entryDir,
  type ManualStep,
  NO_CHANGES,
  ownsColors,
  POSTCSS_CONFIGS,
  turnCallDerivationOff,
  type WiringPlan,
} from './react';
import {
  applyInsertions,
  endOf,
  importInsertion,
  type Insertion,
  lineIndent,
  parseModule,
  startOf,
} from './source-edit';

const STORYBOOK_DIR = '.storybook';
const DEFAULT_PREVIEW = `${STORYBOOK_DIR}/preview.ts`;
const PREVIEW_FILES = [
  DEFAULT_PREVIEW,
  ...['tsx', 'js', 'jsx', 'mjs'].map(
    (extension) => `${STORYBOOK_DIR}/preview.${extension}`
  ),
];
const DEFAULT_MAIN = `${STORYBOOK_DIR}/main.ts`;
const MAIN_FILES = [
  DEFAULT_MAIN,
  ...['mts', 'js', 'mjs', 'cjs'].map(
    (extension) => `${STORYBOOK_DIR}/main.${extension}`
  ),
];
/** The wiring file setup's stories bring, in the nxds folder. */
const WIRING = 'storybook';
export const WIRING_FILE = `${WIRING}.tsx`;
const DOCS = 'https://nxds.dev/getting-started/storybook';

/** Whether the app has a Storybook config folder. */
export function hasStorybook(project: Project) {
  return existsSync(path.join(project.root, STORYBOOK_DIR));
}

/** The Storybook version the app runs: the installed one, else the lowest its range allows. */
function storybookVersion(project: Project) {
  const installed = installedVersion(project, 'storybook');
  if (installed !== null) return installed;
  const declared = project.dependencies.storybook;
  if (declared === undefined || validRange(declared) === null) return null;
  return minVersion(declared)?.version ?? null;
}

/** Why the release's stories won't run in this app's Storybook, or null. */
export function storybookProblem(release: Catalog, project: Project) {
  const { storybook } = release;
  if (!storybook) {
    return `nxds ${release.version} has no stories. Run \`${CLI_COMMAND} update\` to move to a release that has them.`;
  }
  if (!('storybook' in project.dependencies)) {
    return 'This app has no Storybook. Add it with `npx storybook@latest init`.';
  }
  const version = storybookVersion(project);
  if (
    version !== null &&
    !satisfies(version, storybook.range, { includePrerelease: true })
  ) {
    return `nxds stories need Storybook ${storybook.range}, and this app has storybook ${version}. Upgrade it with \`npx storybook@latest upgrade\`.`;
  }
  if (!storybookFramework(release, project)) {
    return `nxds stories run in a Vite-based Storybook, and this app has neither ${storybook.frameworks.join(' nor ')}. Move your Storybook to one of them.`;
  }
  return null;
}

function read(project: Project, file: string) {
  return readFileSync(path.join(project.root, file), 'utf8');
}

/**
 * The object a Storybook config file exports: directly, through a `const`, or
 * through a helper such as `definePreview({ … })`.
 */
function exportedObject(program: Program): ObjectExpression | undefined {
  const declaration = program.body.find((node) =>
    isExportDefaultDeclaration(node)
  )?.declaration;

  function objectOf(
    node: Node | null | undefined
  ): ObjectExpression | undefined {
    if (!node) return undefined;
    if (isObjectExpression(node)) return node;
    if (isTSSatisfiesExpression(node) || isTSAsExpression(node)) {
      return objectOf(node.expression);
    }
    if (isCallExpression(node)) return objectOf(node.arguments[0]);
    if (!isIdentifier(node)) return undefined;
    for (const statement of program.body) {
      if (!isVariableDeclaration(statement)) continue;
      const declared = statement.declarations.find((candidate) =>
        isIdentifier(candidate.id, { name: node.name })
      );
      if (declared) return objectOf(declared.init);
    }
    return undefined;
  }
  return objectOf(declaration);
}

/** Whether an object literal spreads another in, which may set any member. */
function hasSpread(object: ObjectExpression) {
  return object.properties.some((member) => isSpreadElement(member));
}

/** Whether a member's key is `name`, bare or quoted. */
function hasKey(member: ObjectProperty | ObjectMethod, name: string) {
  return (
    isIdentifier(member.key, { name }) ||
    isStringLiteral(member.key, { value: name })
  );
}

/** Whether an object literal has a property or method named `name`. */
function hasMember(object: ObjectExpression, name: string) {
  return object.properties.some(
    (member) =>
      (isObjectProperty(member) || isObjectMethod(member)) &&
      hasKey(member, name)
  );
}

function property(object: ObjectExpression, name: string) {
  return object.properties.find(
    (candidate): candidate is ObjectProperty =>
      isObjectProperty(candidate) && hasKey(candidate, name)
  );
}

/** Adds `entries` after the last entry of an object or array literal. */
function appended(
  source: string,
  literal: ObjectExpression | ArrayExpression,
  entries: string[]
): Insertion {
  const last = (
    isObjectExpression(literal) ? literal.properties : literal.elements
  ).at(-1);
  if (!last) return { at: startOf(literal) + 1, text: entries.join(', ') };
  const sameLine = !source.slice(startOf(literal), endOf(last)).includes('\n');
  const separator = sameLine ? ', ' : `,\n${lineIndent(source, startOf(last))}`;
  return {
    at: endOf(last),
    text: entries.map((entry) => `${separator}${entry}`).join(''),
  };
}

/** Adds `text` before the first entry of an object literal. */
function prepended(
  source: string,
  object: ObjectExpression,
  text: string
): Insertion {
  const [first] = object.properties;
  if (!first) return { at: startOf(object) + 1, text };
  const sameLine = !source
    .slice(startOf(object), startOf(first))
    .includes('\n');
  return {
    at: startOf(first),
    text: sameLine
      ? `${text}, `
      : `${text},\n${lineIndent(source, startOf(first))}`,
  };
}

const A11Y_LEVELS = [
  ['parameters', 'nxds.parameters'],
  ['a11y', 'nxds.parameters.a11y'],
  ['options', 'nxds.parameters.a11y.options'],
] as const;

/**
 * The edits that add nxds's decorator, toolbar and accessibility settings to
 * a preview object, keeping what it sets itself. Null when one of them is
 * written in a way the edit can't extend, such as a variable, or when an
 * object the edit adds a member to has a spread, which may set that member.
 */
function previewInsertions(source: string, preview: ObjectExpression) {
  if (hasSpread(preview)) return null;
  const insertions: Insertion[] = [];
  /** The properties the preview lacks. */
  const added: string[] = [];
  const own = (object: ObjectExpression, name: string) =>
    property(object, name)?.value as Expression | undefined;

  const decorators = own(preview, 'decorators');
  if (!decorators) {
    added.push('decorators: nxds.decorators');
  } else if (isArrayExpression(decorators)) {
    // The first decorator is the innermost, so the provider wraps the rest.
    insertions.push(appended(source, decorators, ['...nxds.decorators']));
  } else {
    return null;
  }

  for (const name of ['globalTypes', 'initialGlobals']) {
    const value = own(preview, name);
    if (!value) {
      added.push(`${name}: nxds.${name}`);
    } else if (isObjectExpression(value)) {
      insertions.push(prepended(source, value, `...nxds.${name}`));
    } else {
      return null;
    }
  }

  // nxds's accessibility settings go in at the first level the preview
  // doesn't set itself.
  let object = preview;
  for (const [name, from] of A11Y_LEVELS) {
    const value = own(object, name);
    if (value && (!isObjectExpression(value) || hasSpread(value))) return null;
    if (value) {
      object = value;
      continue;
    }
    const entry = `${name}: ${from}`;
    if (object === preview) added.push(entry);
    else insertions.push(appended(source, object, [entry]));
    return added.length > 0
      ? [...insertions, appended(source, preview, added)]
      : insertions;
  }
  // The preview sets its own axe options, so the edit can't add nxds's rules.
  return null;
}

const DERIVED_PREVIEW = 'nxdsPreview(defaultAppearance)';
const OWN_COLORS_PREVIEW = `nxdsPreview(defaultAppearance, { ${DERIVE_COLORS_OFF_OPTION} })`;

/**
 * Wires nxds into `.storybook/preview`: the nxds CSS entry, and the appearance
 * decorator, toolbar and accessibility settings from the wiring file. A
 * preview the edit can't extend is a manual step. For an app's own colors,
 * the stories don't derive colors either.
 */
function wirePreview(
  project: Project,
  config: Config,
  framework: string,
  ownColors: boolean
): WiringPlan {
  const file = findFile(project, PREVIEW_FILES) ?? DEFAULT_PREVIEW;
  const wiring = relativeImport(file, `${config.dir}/${WIRING}`);
  const call = ownColors ? OWN_COLORS_PREVIEW : DERIVED_PREVIEW;
  const lines = [
    `import '${relativeImport(file, config.css)}';`,
    `import { nxdsPreview } from '${wiring}';`,
    `import { defaultAppearance } from '${relativeImport(file, `${entryDir(project)}/appearance-state`)}';`,
    '',
    `const nxds = ${call};`,
  ];
  if (!existsSync(path.join(project.root, file))) {
    return {
      changes: [
        {
          path: file,
          content: [
            `import type { Preview } from '${framework}';`,
            '',
            ...lines,
            '',
            'const preview: Preview = {',
            '  decorators: nxds.decorators,',
            '  parameters: nxds.parameters,',
            '  globalTypes: nxds.globalTypes,',
            '  initialGlobals: nxds.initialGlobals,',
            '};',
            '',
            'export default preview;',
            '',
          ].join('\n'),
          created: true,
        },
      ],
      manual: [],
    };
  }

  const source = read(project, file);
  if (source.includes('nxdsPreview')) {
    if (!ownColors) return NO_CHANGES;
    return turnCallDerivationOff(file, source, {
      derived: DERIVED_PREVIEW,
      own: OWN_COLORS_PREVIEW,
      callee: 'nxdsPreview',
    });
  }
  const program = parseModule(source, file);
  const preview = exportedObject(program);
  const insertions = preview && previewInsertions(source, preview);
  if (!insertions) {
    return {
      changes: [],
      manual: [
        {
          file,
          step: `Import your nxds CSS entry and nxdsPreview from '${wiring}', then add the decorators, parameters, globalTypes and initialGlobals of ${call} to the preview. See ${DOCS}.`,
        },
      ],
    };
  }
  return {
    changes: [
      {
        path: file,
        content: applyInsertions(source, [
          ...insertions,
          importInsertion(source, program, lines),
        ]),
        created: false,
      },
    ],
    manual: [],
  };
}

/** The files Storybook reads from a `stories` entry that names only a folder. */
const DEFAULT_STORY_FILES = '**/*.@(mdx|stories.@(js|jsx|mjs|ts|tsx))';
/** Where a component's and a block's story sit in the nxds folder, to try entries on. */
const SAMPLE_STORIES = [
  'components/button/Button.stories.tsx',
  'blocks/editing/inline-edit/InlineEdit.stories.tsx',
];

/**
 * A `stories` entry as one glob, from `.storybook`: the glob it is, or its
 * folder with the files Storybook reads there.
 */
function storiesGlob(entry: Node | null) {
  if (isStringLiteral(entry)) {
    return picomatch.scan(entry.value).isGlob
      ? entry.value
      : `${entry.value}/${DEFAULT_STORY_FILES}`;
  }
  if (!isObjectExpression(entry)) return null;
  const directory = property(entry, 'directory')?.value;
  if (!isStringLiteral(directory)) return null;
  const files = property(entry, 'files')?.value;
  return `${directory.value}/${isStringLiteral(files) ? files.value : DEFAULT_STORY_FILES}`;
}

/**
 * Whether a `stories` list loads the stories in the nxds folder, components'
 * and blocks' alike, matched as Storybook matches them.
 */
function loadsStories(stories: ArrayExpression, dir: string) {
  const globs = stories.elements
    .map(storiesGlob)
    .filter((glob) => glob !== null)
    .map((glob) => path.posix.join(STORYBOOK_DIR, glob));
  return SAMPLE_STORIES.every((sample) =>
    picomatch.isMatch(`${dir}/${sample}`, globs)
  );
}

const TAILWIND_VITE = '@tailwindcss/vite';

/**
 * Whether Storybook's Vite already runs Tailwind: through the app's own Vite
 * config, or through a PostCSS config, which Vite reads.
 */
function buildsTailwind(project: Project) {
  if (project.setup === 'vite-react') return true;
  const postcss = findFile(project, POSTCSS_CONFIGS);
  return (
    postcss !== undefined &&
    read(project, postcss).includes('@tailwindcss/postcss')
  );
}

type MainPlan = WiringPlan & {
  /** Dev packages the edit imports, by name, at `tailwind`'s range. */
  devPackages: Record<string, string>;
};

/** What the app's files don't show about it yet. */
type StorybookApp = {
  /** The Tailwind range the release installs. */
  tailwind: string;
  /** Whether `init` is adding Tailwind to the app's build in this run. */
  addsTailwind: boolean;
  /** Whether the app sets its own colors. */
  ownColors: boolean;
};

/**
 * What `.storybook/main` needs for the nxds stories: an entry that loads the
 * nxds folder's stories, and Tailwind's Vite plugin where the app's build runs
 * Tailwind out of Storybook's sight, as Next.js with Turbopack does. Each part
 * the edit can't add is a manual step.
 */
function wireMain(
  project: Project,
  config: Config,
  { tailwind, addsTailwind }: StorybookApp
): MainPlan {
  const file = findFile(project, MAIN_FILES);
  const source = file ? read(project, file) : '';
  const program = file ? parseModule(source, file) : undefined;
  const main = program && exportedObject(program);
  const target = file ?? DEFAULT_MAIN;
  const insertions: Insertion[] = [];
  const imports: string[] = [];
  const manual: ManualStep[] = [];
  const devPackages: Record<string, string> = {};

  const folder = relativeImport(`${STORYBOOK_DIR}/main`, config.dir);
  const glob = `${folder}/**/*.stories.tsx`;
  const stories = main && property(main, 'stories')?.value;
  // A `stories` the edit can't read, such as a function, is a step for you,
  // done once main names the nxds folder.
  if (!isArrayExpression(stories) && !source.includes(folder)) {
    manual.push({ file: target, step: `Add '${glob}' to stories.` });
  }
  if (isArrayExpression(stories) && !loadsStories(stories, config.dir)) {
    // The entry takes the quotes the file's other entries use.
    const written = stories.elements.find((entry) => isStringLiteral(entry));
    const quote = written ? source.charAt(startOf(written)) : "'";
    insertions.push(appended(source, stories, [`${quote}${glob}${quote}`]));
  }

  // Tailwind that `init` is adding goes where Storybook's Vite sees it.
  const seesTailwind = addsTailwind || buildsTailwind(project);
  if (!seesTailwind && !source.includes(TAILWIND_VITE)) {
    devPackages[TAILWIND_VITE] = tailwind;
    if (main && !hasSpread(main) && !hasMember(main, 'viteFinal')) {
      imports.push(`import tailwindcss from '${TAILWIND_VITE}';`);
      insertions.push(
        appended(source, main, [
          'viteFinal: (config) => ({ ...config, plugins: [...(config.plugins ?? []), tailwindcss()] })',
        ])
      );
    } else {
      manual.push({
        file: target,
        step: `Add tailwindcss() from '${TAILWIND_VITE}' to the plugins in viteFinal, so Storybook builds the nxds CSS.`,
      });
    }
  }

  if (!program || insertions.length === 0) {
    return { changes: [], manual, devPackages };
  }
  if (imports.length > 0) {
    insertions.push(importInsertion(source, program, imports));
  }
  return {
    changes: [
      {
        path: target,
        content: applyInsertions(source, insertions),
        created: false,
      },
    ],
    manual,
    devPackages,
  };
}

/**
 * What `init --stories` writes or edits in `.storybook`: the preview takes
 * nxds's wiring, and main lists the nxds folder's stories and builds its CSS.
 */
export function planStorybook(
  project: Project,
  config: Config,
  framework: string,
  app: StorybookApp
): MainPlan {
  const preview = wirePreview(project, config, framework, app.ownColors);
  const main = wireMain(project, config, app);
  return {
    changes: [...preview.changes, ...main.changes],
    manual: [...preview.manual, ...main.manual],
    devPackages: main.devPackages,
  };
}

/**
 * Why the installed stories won't render as nxds's own do, or null: what
 * `init --stories` would still edit, or leave as a step for you. That covers a
 * preview that derives colors over the app's own.
 */
export function storybookWiringProblem(
  project: Project,
  config: Config,
  framework: string,
  tailwind: string
) {
  const { changes, manual } = planStorybook(project, config, framework, {
    tailwind,
    addsTailwind: false,
    ownColors: ownsColors(project, config),
  });
  const [step] = manual;
  if (step) return `${step.file}: ${step.step}`;
  if (changes.length === 0) return null;
  return `${changes.map((change) => change.path).join(' and ')} ${changes.length === 1 ? 'is' : 'are'} not wired for nxds's stories. Run \`${CLI_COMMAND} init --stories\`.`;
}
