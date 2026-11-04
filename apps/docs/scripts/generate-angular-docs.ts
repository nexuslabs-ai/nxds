// Builds the Angular side of every component page from packages/angular, under
// generated/angular/:
//   demos/{slug}/{story}.ts     each story tagged `docs`, as a standalone component the live previews mount
//   entry.js                    mounts a demo by id; bundle:angular compiles it for the live previews
//   example-icons.js            the stories' icons, drawn by the reader's library
//   switchable-icons.js         the components' own icons, drawn by the reader's library
//   tsconfig.json               the program bundle:angular compiles ahead of time
//   docs.ts                     titles, captions, sources by icon library, and imports
//   props/{slug}.json           each part's own props
// usage: node scripts/generate-angular-docs.ts
import {
  angular,
  frameworkWalks,
} from '@nxds/catalog/scripts/dependency-plans.mjs';
import { packageName } from '@nxds/catalog/scripts/install-plans.ts';
import {
  componentProps,
  createAngularProgram,
  exportedSlugs,
} from '@nxds/source-model/angular-sources.ts';
import {
  angularExampleSource,
  exampleIconPackages,
} from '@nxds/source-model/example-icon-sources.ts';
import {
  exampleIconName,
  ICON_LIBRARIES,
  ICON_PACKAGES,
  iconExport,
  type IconLibrary,
} from '@nxds/source-model/example-icons.ts';
import { humanize, pascal } from '@nxds/source-model/humanize.ts';
import {
  type PropsFile,
  toPropsIndex,
} from '@nxds/source-model/props-entries.ts';
import {
  angularComponentsRoot,
  angularRoot,
  angularSrc,
  toRepoPath,
} from '@nxds/source-model/roots.mjs';
import {
  dedent,
  docsDescription,
  isDocsStory,
  kebab,
  property,
  unwrap,
} from '@nxds/source-model/story-ast.ts';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import prettier from 'prettier';
import ts from 'typescript';

import { docsRoot } from './docs-root.mjs';

interface DocsStory {
  id: string;
  title: string;
  description: string | null;
  className: string;
  /** Import names by the module a reader imports them from. */
  byModule: Map<string, string[]>;
  fields: { name: string; value: string; constant: boolean }[];
  template: string;
}

interface AngularDemo {
  id: string;
  title: string;
  description: string | null;
  sources: Record<IconLibrary, string>;
  alsoInstall: string[];
  packages: Record<IconLibrary, string[]>;
}

interface AngularComponentDocs {
  description: string;
  preview: string;
  examples: string[];
  imports: string;
}

const outputDir = path.join(docsRoot, 'generated', 'angular');
const demosDir = path.join(outputDir, 'demos');
const propsDir = path.join(outputDir, 'props');
const exampleIconsFile = path.join(outputDir, 'example-icons.js');

const PHOSPHOR = ICON_PACKAGES.phosphor.angular.icons;

const prettierConfig =
  (await prettier.resolveConfig(path.join(angularSrc, 'lib', 'utils.ts'))) ??
  {};

function fail(message: string): never {
  throw new Error(`generate-angular-docs: ${message}`);
}

function parseFile(file: string) {
  return ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
}

/** Where an import in a story file points, as the reader writes it. */
function readerModule(specifier: string, storyFile: string) {
  if (!specifier.startsWith('.')) return specifier;
  const target = path.resolve(path.dirname(storyFile), specifier);
  return `@/${path.relative(angularSrc, target).split(path.sep).join('/')}`;
}

/** The selector of the class `name` exports from `file`, or null. */
function selectorOf(file: string, name: string) {
  const source = parseFile(`${file}.ts`);
  for (const statement of source.statements) {
    if (!ts.isClassDeclaration(statement) || statement.name?.text !== name) {
      continue;
    }
    for (const decorator of ts.getDecorators(statement) ?? []) {
      const call = decorator.expression;
      if (!ts.isCallExpression(call)) continue;
      const [options] = call.arguments;
      if (!options || !ts.isObjectLiteralExpression(options)) continue;
      const selector = property(options, 'selector');
      if (selector && ts.isStringLiteral(selector)) return selector.text;
    }
  }
  return null;
}

/** Whether `template` uses `selector`: one of its elements or attributes. */
function usesSelector(template: string, selector: string) {
  return selector.split(',').some((part) => {
    const attribute = part.match(/\[([\w-]+)\]/)?.[1];
    if (attribute) {
      return new RegExp(`[\\s\\[(]${attribute}(?![\\w-])`).test(template);
    }
    return new RegExp(`<${part.trim()}[\\s>/]`).test(template);
  });
}

/** Angular modules a template uses without a selector of their own. */
const MODULE_MARKERS: Record<string, RegExp> = { FormsModule: /ngModel/ };

/** The names a `moduleMetadata({ imports: [ … ] })` decorator lists. */
function metadataImports(object: ts.ObjectLiteralExpression) {
  const decorators = property(object, 'decorators');
  if (!decorators || !ts.isArrayLiteralExpression(decorators)) return [];
  return decorators.elements.flatMap((decorator) => {
    if (!ts.isCallExpression(decorator)) return [];
    if (decorator.expression.getText() !== 'moduleMetadata') return [];
    const [options] = decorator.arguments;
    if (!options || !ts.isObjectLiteralExpression(options)) return [];
    const imports = property(options, 'imports');
    if (!imports || !ts.isArrayLiteralExpression(imports)) return [];
    return imports.elements.map((element) => element.getText());
  });
}

/**
 * A story's `props` as component fields. A const object, such as `icons`, or
 * a spread of one gives one field per property.
 */
function storyFields(
  where: string,
  props: ts.Node | undefined,
  consts: Map<string, ts.ObjectLiteralExpression>
): DocsStory['fields'] {
  if (!props) return [];
  const object = ts.isIdentifier(props) ? consts.get(props.text) : props;
  if (!object || !ts.isObjectLiteralExpression(object)) {
    fail(`${where}: props must be an object literal or a const object.`);
  }
  return object.properties.flatMap((prop) => {
    if (ts.isSpreadAssignment(prop)) {
      return storyFields(where, unwrap(prop.expression), consts);
    }
    if (!ts.isPropertyAssignment(prop)) {
      fail(`${where}: props need a name and a value, as \`open: true\`.`);
    }
    const value = unwrap(prop.initializer);
    return [
      {
        name: prop.name.getText(),
        value: value.getText(),
        constant: ts.isIdentifier(value),
      },
    ];
  });
}

/** The stories tagged `docs` in one component's story file. */
function readDocsStories(slug: string) {
  const dir = path.join(angularComponentsRoot, slug);
  const file = path.join(dir, `${pascal(slug)}.stories.ts`);
  let source: ts.SourceFile;
  try {
    source = parseFile(file);
  } catch {
    return null;
  }

  const imported = new Map<string, string>();
  const consts = new Map<string, ts.ObjectLiteralExpression>();
  let meta: ts.ObjectLiteralExpression | undefined;
  const stories: { name: string; object: ts.ObjectLiteralExpression }[] = [];

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const bindings = statement.importClause?.namedBindings;
      if (!bindings || !ts.isNamedImports(bindings)) continue;
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;
      for (const element of bindings.elements) {
        if (element.isTypeOnly) continue;
        imported.set(element.name.text, statement.moduleSpecifier.text);
      }
      continue;
    }
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      const init = declaration.initializer && unwrap(declaration.initializer);
      if (!init || !ts.isObjectLiteralExpression(init)) continue;
      const name = declaration.name.getText();
      if (name === 'meta') meta = init;
      else if (isDocsStory(init)) stories.push({ name, object: init });
      else consts.set(name, init);
    }
  }

  if (stories.length === 0) return null;
  if (!meta) fail(`${toRepoPath(file)} has no \`const meta\`.`);
  const available = metadataImports(meta);

  return {
    description: docsDescription(meta, 'component') ?? '',
    stories: stories.map(({ name, object }) => {
      const where = `${slug}/${name}`;
      const render = property(object, 'render');
      if (
        !render ||
        !ts.isArrowFunction(render) ||
        render.parameters.length > 0 ||
        ts.isBlock(render.body)
      ) {
        fail(
          `${where}: a docs story needs its own \`render: () => ({ … })\`, with no args.`
        );
      }
      const body = unwrap(render.body);
      if (!ts.isObjectLiteralExpression(body)) {
        fail(`${where}: render must return an object literal.`);
      }
      const template = property(body, 'template');
      if (
        !template ||
        !(
          ts.isNoSubstitutionTemplateLiteral(template) ||
          ts.isStringLiteral(template)
        )
      ) {
        fail(`${where}: render needs a plain \`template\` string.`);
      }
      const text = dedent(template.text);
      // A shared object such as `icons` may hold values this template never reads.
      const fields = storyFields(where, property(body, 'props'), consts).filter(
        ({ name }) => new RegExp(`\\b${name}\\b`).test(text)
      );

      const used = [
        ...available.filter((name) => {
          const marker = MODULE_MARKERS[name];
          if (marker) return marker.test(text);
          const specifier =
            imported.get(name) ??
            fail(`${where}: \`${name}\` is not imported.`);
          if (!specifier.startsWith('.')) return false;
          const selector = selectorOf(path.resolve(dir, specifier), name);
          return selector !== null && usesSelector(text, selector);
        }),
        ...fields.filter(({ constant }) => constant).map(({ value }) => value),
      ];
      const byModule = new Map<string, string[]>();
      for (const id of used) {
        const specifier =
          imported.get(id) ?? fail(`${where}: \`${id}\` is not imported.`);
        const module = readerModule(specifier, file);
        byModule.set(module, [...(byModule.get(module) ?? []), id]);
      }

      return {
        id: `${slug}/${kebab(name)}`,
        title: humanize(kebab(name)),
        description: docsDescription(object, 'story'),
        className: `${pascal(slug)}${name}`,
        byModule,
        fields,
        template: text,
      } satisfies DocsStory;
    }),
  };
}

/** The standalone component a reader copies for `story`. */
async function componentSource(story: DocsStory) {
  const line = (module: string) =>
    `import { ${[...new Set(story.byModule.get(module))].sort().join(', ')} } from '${module}';`;
  const modules = [...story.byModule.keys()].sort();
  const packages = [
    "import { Component } from '@angular/core';",
    ...modules.filter((module) => !module.startsWith('@/')).map(line),
  ];
  const local = modules.filter((module) => module.startsWith('@/')).map(line);
  const imports = [...story.byModule]
    .filter(
      ([module]) => module.startsWith('@/') || module === '@angular/forms'
    )
    .flatMap(([, names]) => names)
    .filter((name) => !story.fields.some(({ value }) => value === name))
    .sort();
  const selector = `app-${story.id.replace('/', '-')}`;
  const indented = story.template
    .split('\n')
    .map((row) => (row ? `    ${row}` : row))
    .join('\n');
  const fields = story.fields.map(
    ({ name, value, constant }) =>
      `  protected ${constant ? 'readonly ' : ''}${name} = ${value};`
  );

  return prettier.format(
    `${packages.join('\n')}\n\n${local.join('\n')}\n\n@Component({\n  selector: '${selector}',\n  imports: [${imports.join(', ')}],\n  template: \`\n${indented}\n  \`,\n})\nexport class ${story.className} {\n${fields.join('\n')}\n}\n`,
    { ...prettierConfig, parser: 'typescript' }
  );
}

/** `source` as each icon library draws it. */
async function iconLibrarySources(id: string, source: string) {
  const drawn = await Promise.all(
    ICON_LIBRARIES.map(async (library) => {
      const rewritten = angularExampleSource(id, source, library);
      return [
        library,
        rewritten === source
          ? source
          : await prettier.format(rewritten, {
              ...prettierConfig,
              parser: 'typescript',
            }),
      ] as const;
    })
  );
  return Object.fromEntries(drawn) as Record<IconLibrary, string>;
}

/** The demo `file` mounts: nxds from packages/angular, story icons from the switchable set. */
function livePreview(file: string, source: string) {
  const relative = (target: string) => {
    const from = path
      .relative(path.dirname(file), target)
      .split(path.sep)
      .join('/');
    return from.startsWith('.') ? from : `./${from}`;
  };
  return source
    .replace(
      `from '${PHOSPHOR}'`,
      `from '${relative(exampleIconsFile).replace(/\.js$/, '')}'`
    )
    .replace(
      /from '@\/([^']+)'/g,
      (_, target: string) => `from '${relative(path.join(angularSrc, target))}'`
    );
}

// ── Icon libraries ──────────────────────────────────────────────────────────

/** Each story icon under its Phosphor export name, drawn by the reader's library. */
function exampleIconsModule(names: Set<string>) {
  const imports = new Map<string, Set<string>>();
  const add = (from: string, name: string) =>
    imports.set(from, (imports.get(from) ?? new Set()).add(name));
  const sets = [...names].sort().map((name) => {
    const phosphor = name.replace(/^phosphor/, '');
    const drawn = ICON_LIBRARIES.map((library) => {
      const icon = iconExport(
        library,
        'angular',
        exampleIconName(phosphor, library)
      );
      const alias = `${library}_${icon}`;
      add(ICON_PACKAGES[library].angular.icons, `${icon} as ${alias}`);
      return `${library}: ${library === 'hugeicons' ? `hugeicon(${alias})` : alias}`;
    });
    return `  ${name}: { ${drawn.join(', ')} },`;
  });
  return `// Generated by apps/docs/scripts/generate-angular-docs.ts — do not edit.
${[...imports]
  .map(
    ([from, list]) =>
      `import { ${[...list].sort().join(', ')} } from '${from}';`
  )
  .join('\n')}

import { hugeicon } from '../../../../packages/angular/src/lib/icon';

const sets = {
${sets.join('\n')}
};

${[...names]
  .sort()
  .map((name) => `export let ${name} = sets.${name}.phosphor;`)
  .join('\n')}

/** Draws every story icon in \`library\`; a remounted demo picks it up. */
export function setExampleIconLibrary(library) {
${[...names]
  .sort()
  .map((name) => `  ${name} = sets.${name}[library];`)
  .join('\n')}
}
`;
}

/** Each icon the components draw themselves, from @nxds/angular's icon sets. */
function switchableIconsModule() {
  const icons = parseFile(path.join(angularSrc, 'lib', 'icons.ts'));
  const names = icons.statements.flatMap((statement) =>
    ts.isVariableStatement(statement)
      ? statement.declarationList.declarations.map(({ name }) => name.getText())
      : []
  );
  return `// Generated by apps/docs/scripts/generate-angular-docs.ts — do not edit.
import { ICON_SETS } from '../../../../packages/angular/src/lib/icon-libraries';

${names.map((name) => `export let ${name} = ICON_SETS.phosphor.${name};`).join('\n')}

/** Draws every component icon in \`library\`; a remounted demo picks it up. */
export function setComponentIconLibrary(library) {
${names.map((name) => `  ${name} = ICON_SETS[library].${name};`).join('\n')}
}
`;
}

// ── Write everything ────────────────────────────────────────────────────────

const slugs = exportedSlugs();
const closures = frameworkWalks(angular, slugs);
const componentDocs: Record<string, AngularComponentDocs> = {};
const demos: Record<string, AngularDemo> = {};
const demoClasses: Record<string, string> = {};
const storyIcons = new Set<string>();

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(propsDir, { recursive: true });

const program = createAngularProgram();
const propsFiles: PropsFile[] = [];

for (const slug of slugs) {
  const docs = readDocsStories(slug);
  if (!docs) continue;

  const walked = closures.get(slug) ?? fail(`${slug} has no source files.`);
  /** Every package installing the component brings, its components' included. */
  const brings = new Set(walked.packages);

  const propsFile = componentProps(program, slug);
  propsFiles.push(propsFile);
  writeFileSync(
    path.join(propsDir, `${slug}.json`),
    `${JSON.stringify(propsFile, null, 2)}\n`
  );

  const pageImports = new Set<string>();
  for (const story of docs.stories) {
    const alsoInstall = [...story.byModule.keys()]
      .map((module) => module.match(/^@\/components\/([\w-]+)\//)?.[1])
      .filter(
        (other): other is string => other !== undefined && other !== slug
      );
    const modules = [...story.byModule.keys()].filter(
      (module) => !module.startsWith('@/')
    );
    const packagesFor = (library: IconLibrary) =>
      [
        ...modules.filter((module) => module !== PHOSPHOR),
        ...(modules.includes(PHOSPHOR)
          ? exampleIconPackages(library, 'angular')
          : []),
      ]
        .map(packageName)
        .filter((name) => !brings.has(name))
        .map((name) => `${name}@${angular.publishedRange(name)}`);

    for (const name of story.byModule.get(PHOSPHOR) ?? []) {
      storyIcons.add(name);
    }

    const source = await componentSource(story);
    demos[story.id] = {
      id: story.id,
      title: story.title,
      description: story.description,
      sources: await iconLibrarySources(story.id, source),
      alsoInstall,
      packages: Object.fromEntries(
        ICON_LIBRARIES.map((library) => [library, packagesFor(library)])
      ) as Record<IconLibrary, string[]>,
    };
    demoClasses[story.id] = story.className;
    const demoFile = path.join(demosDir, `${story.id}.ts`);
    mkdirSync(path.dirname(demoFile), { recursive: true });
    writeFileSync(demoFile, livePreview(demoFile, source));

    for (const part of story.byModule.get(`@/components/${slug}/${slug}`) ??
      []) {
      pageImports.add(part);
    }
  }

  const [preview, ...examples] = docs.stories.map(({ id }) => id);
  componentDocs[slug] = {
    description: docs.description,
    preview: preview ?? fail(`${slug} has no docs stories.`),
    examples,
    imports: `import { ${[...pageImports].sort().join(', ')} } from '@/components/${slug}/${slug}';`,
  };
}

writeFileSync(
  path.join(propsDir, 'index.json'),
  `${JSON.stringify(toPropsIndex(propsFiles), null, 2)}\n`
);

writeFileSync(
  path.join(outputDir, 'docs.ts'),
  `// Generated by apps/docs/scripts/generate-angular-docs.ts — do not edit.
// Run \`pnpm --filter @nxds/docs generate:angular\` to regenerate.

import type {
  FrameworkComponentDocs,
  FrameworkDemo,
} from '../../app/_lib/framework-docs';

export const angularDemos: Record<string, FrameworkDemo> = ${JSON.stringify(demos, null, 2)};

export const angularComponentDocs: Record<string, FrameworkComponentDocs> = ${JSON.stringify(componentDocs, null, 2)};
`
);

writeFileSync(
  exampleIconsFile,
  await prettier.format(exampleIconsModule(storyIcons), {
    ...prettierConfig,
    parser: 'babel',
  })
);
writeFileSync(
  path.join(outputDir, 'switchable-icons.js'),
  await prettier.format(switchableIconsModule(), {
    ...prettierConfig,
    parser: 'babel',
  })
);

writeFileSync(
  path.join(outputDir, 'tsconfig.json'),
  `${JSON.stringify(
    {
      extends: path.relative(
        outputDir,
        path.join(angularRoot, 'tsconfig.json')
      ),
      compilerOptions: { rootDir: '../../../..' },
      include: [
        'demos/**/*.ts',
        path.relative(outputDir, path.join(angularSrc, '**/*.ts')),
      ],
      exclude: [
        path.relative(outputDir, path.join(angularSrc, '**/*.stories.ts')),
      ],
    },
    null,
    2
  )}\n`
);

writeFileSync(
  path.join(outputDir, 'entry.js'),
  `// Generated by apps/docs/scripts/generate-angular-docs.ts — do not edit.
import { createApplication } from '@angular/platform-browser';

import { setExampleIconLibrary } from './example-icons';
import { setComponentIconLibrary } from './switchable-icons';

/** Draws demos mounted from now on in \`library\`, the reader's pick. */
export function setIconLibrary(library) {
  setExampleIconLibrary(library);
  setComponentIconLibrary(library);
}

const demos = {
${Object.entries(demoClasses)
  .map(
    ([id, className]) =>
      `  ${JSON.stringify(id)}: () => import('./demos/${id}').then((module) => module.${className}),`
  )
  .join('\n')}
};

/** Mounts one docs demo into \`element\` as its own app. Returns the unmount. */
export async function mount(element, id) {
  const load = demos[id];
  if (!load) throw new Error(\`No Angular demo "\${id}".\`);
  const component = await load();
  const app = await createApplication();
  const host = document.createElement('div');
  element.append(host);
  app.bootstrap(component, host);
  return () => {
    app.destroy();
    host.remove();
  };
}
`
);

console.log(
  `Angular docs: ${Object.keys(componentDocs).length} components, ${Object.keys(demos).length} demos -> ${toRepoPath(outputDir)}`
);
