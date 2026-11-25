import {
  type ArrayExpression,
  type Expression,
  isArrayExpression,
  isCallExpression,
  isExportDefaultDeclaration,
  isIdentifier,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  isTSAsExpression,
  isTSSatisfiesExpression,
  isVariableDeclaration,
  type Node,
  type ObjectExpression,
  type ObjectProperty,
  type Program,
} from '@babel/types';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { minVersion, satisfies, validRange } from 'semver';

import { type Catalog, storybookFramework } from '../catalog';
import { CLI_COMMAND } from '../cli-command';
import type { Config } from '../config';
import { relativeImport } from '../files';
import { installedVersion } from '../packages';
import { findFile, type Project } from '../project';

import { entryDir, type WiringPlan } from './react';
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

function property(object: ObjectExpression, name: string) {
  return object.properties.find(
    (candidate): candidate is ObjectProperty =>
      isObjectProperty(candidate) &&
      (isIdentifier(candidate.key, { name }) ||
        isStringLiteral(candidate.key, { value: name }))
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
 * written in a way the edit can't extend, such as a variable.
 */
function previewInsertions(source: string, preview: ObjectExpression) {
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
    if (value && !isObjectExpression(value)) return null;
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

/**
 * Wires nxds into `.storybook/preview`: the nxds CSS entry, and the appearance
 * decorator, toolbar and accessibility settings from the wiring file. A
 * preview the edit can't extend is a manual step.
 */
function wirePreview(
  project: Project,
  config: Config,
  framework: string
): WiringPlan {
  const file = findFile(project, PREVIEW_FILES) ?? DEFAULT_PREVIEW;
  const wiring = relativeImport(file, `${config.dir}/${WIRING}`);
  const lines = [
    `import '${relativeImport(file, config.css)}';`,
    `import { nxdsPreview } from '${wiring}';`,
    `import { defaultAppearance } from '${relativeImport(file, `${entryDir(project)}/appearance-state`)}';`,
    '',
    'const nxds = nxdsPreview(defaultAppearance);',
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
  if (source.includes('nxdsPreview')) return { changes: [], manual: [] };
  const program = parseModule(source, file);
  const preview = exportedObject(program);
  const insertions = preview && previewInsertions(source, preview);
  if (!insertions) {
    return {
      changes: [],
      manual: [
        {
          file,
          step: `Import your nxds CSS entry and nxdsPreview from '${wiring}', then add its decorators, parameters, globalTypes and initialGlobals to the preview. See ${DOCS}.`,
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

/** The folder a `stories` entry names, as written: its glob, or its `directory`. */
function storiesEntry(entry: Node | null) {
  if (isStringLiteral(entry)) return entry.value;
  if (!isObjectExpression(entry)) return null;
  const directory = property(entry, 'directory')?.value;
  return isStringLiteral(directory) ? directory.value : null;
}

/** Whether a `stories` entry's folder is the nxds folder or one above it. */
function coversDir(entry: Node | null, dir: string) {
  const written = storiesEntry(entry);
  if (written === null) return false;
  // A glob covers the folder its fixed part names.
  const base = written.split(/[*{[(@!?]/)[0] ?? '';
  const folder = path.posix.join(STORYBOOK_DIR, base).replace(/\/+$/, '');
  return (
    folder === '.' ||
    /^\.\.(\/\.\.)*$/.test(folder) ||
    dir === folder ||
    dir.startsWith(`${folder}/`)
  );
}

/**
 * Adds the nxds folder's stories to `.storybook/main`, unless an entry there
 * already covers the folder.
 */
function wireStories(project: Project, config: Config): WiringPlan {
  const file = findFile(project, MAIN_FILES);
  const glob = `${relativeImport(`${STORYBOOK_DIR}/main`, config.dir)}/**/*.stories.tsx`;
  const manual = (target: string): WiringPlan => ({
    changes: [],
    manual: [{ file: target, step: `Add '${glob}' to stories.` }],
  });
  if (!file) return manual(DEFAULT_MAIN);

  const source = read(project, file);
  const main = exportedObject(parseModule(source, file));
  const stories = main && property(main, 'stories')?.value;
  if (!isArrayExpression(stories)) return manual(file);
  if (stories.elements.some((entry) => coversDir(entry, config.dir))) {
    return { changes: [], manual: [] };
  }
  return {
    changes: [
      {
        path: file,
        content: applyInsertions(source, [
          appended(source, stories, [`'${glob}'`]),
        ]),
        created: false,
      },
    ],
    manual: [],
  };
}

/**
 * What `init --stories` writes or edits in `.storybook`: the preview takes
 * nxds's wiring, and main lists the nxds folder's stories.
 */
export function planStorybook(
  project: Project,
  config: Config,
  framework: string
): WiringPlan {
  const plans = [
    wirePreview(project, config, framework),
    wireStories(project, config),
  ];
  return {
    changes: plans.flatMap((plan) => plan.changes),
    manual: plans.flatMap((plan) => plan.manual),
  };
}

/**
 * Why the installed stories won't render as nxds's own do, or null: the
 * preview doesn't take nxds's wiring, or main doesn't list the nxds folder.
 */
export function storybookWiringProblem(project: Project, config: Config) {
  const preview = findFile(project, PREVIEW_FILES) ?? DEFAULT_PREVIEW;
  const wired =
    existsSync(path.join(project.root, preview)) &&
    read(project, preview).includes('nxdsPreview');
  if (!wired) {
    return `${preview} doesn't use nxdsPreview, so stories render without the nxds provider. Run \`${CLI_COMMAND} init --stories\`.`;
  }
  const stories = wireStories(project, config);
  const [step] = stories.manual;
  if (step) return `${step.file}: ${step.step}`;
  const [change] = stories.changes;
  if (change) {
    return `${change.path} doesn't list the stories in ${config.dir}. Run \`${CLI_COMMAND} init --stories\`.`;
  }
  return null;
}
