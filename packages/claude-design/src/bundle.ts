// components/bundle.js: @nxds/react-18 as ONE classic script. It reads React
// and ReactDOM from the page's globals and assigns `window.Nxds`.
import { react18Src } from '@nxds/source-model/roots.mjs';
import { build, type Metafile, type Plugin } from 'esbuild';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { RECHARTS_PARTS } from './canvas/recharts.ts';
import { canvasSchema } from './canvas-schema.ts';
import { canvasProps } from './canvas-transform.ts';
import { CANVAS_PARTS } from './groups.ts';
import { iconSet } from './icon-set.ts';
import type { FlatComponent } from './props.ts';
import { NAMESPACE } from './system-index.ts';

const RUNTIME = path.join(import.meta.dirname, 'runtime');
const JSX_RUNTIME = path.join(RUNTIME, 'jsx-runtime.ts');
const CANVAS_SLOT = path.join(RUNTIME, 'slot.ts');
const RADIX_SLOT = '@radix-ui/react-slot';

/** What each React module the sources import reads from the page. */
const REACT_GLOBALS: Record<string, string> = {
  react: 'module.exports = window.React;',
  'react-dom': 'module.exports = window.ReactDOM;',
  'react-dom/client':
    'module.exports = { createRoot: window.ReactDOM.createRoot, hydrateRoot: window.ReactDOM.hydrateRoot };',
};

const EXPORTS_MODULE = 'nxds:exports';
const ICONS_MODULE = 'nxds:icons';
const SCHEMA_MODULE = 'nxds:canvas-schema';
const ICON_NAMES_MODULE = 'nxds:icon-names';
const SONNER_THEME_MODULE = 'nxds:sonner-theme';
const RECHARTS_MODULE = 'nxds:recharts';
const ATTRIBUTES = path.join(RUNTIME, 'attributes.ts');
const CANVAS_ICON = path.join(RUNTIME, 'icon.ts');
const CANVAS_TOAST = path.join(RUNTIME, 'toast.ts');

// index.ts's utility exports (`getFilterErrors`, `CHART_CATEGORICAL_SERIES`),
// copied statement by statement.
function libExports() {
  const file = path.join(react18Src, 'index.ts');
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  return source.statements
    .filter(
      (statement) =>
        ts.isExportDeclaration(statement) &&
        statement.moduleSpecifier !== undefined &&
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text.startsWith('./lib/')
    )
    .map((statement) => statement.getText());
}

function exportsModule(slugs: readonly string[]) {
  return [
    ...libExports(),
    ...slugs.map((slug) => `export * from './components/${slug}/${slug}';`),
    `export * as Icons from '${ICONS_MODULE}';`,
    `export { Icon } from ${JSON.stringify(CANVAS_ICON)};`,
    `export { Toast } from ${JSON.stringify(CANVAS_TOAST)};`,
    `export * as Recharts from '${RECHARTS_MODULE}';`,
  ].join('\n');
}

function iconsModule() {
  return `export { ${iconSet()
    .map(({ component }) => component)
    .join(', ')} } from '@tabler/icons-react';`;
}

// Each icon by its canvas name, for Nxds.Icon and icon props.
function iconNamesModule() {
  const icons = iconSet();
  return [
    `import { ${icons.map(({ component }) => component).join(', ')} } from '@tabler/icons-react';`,
    `export const ICON_COMPONENTS = { ${icons.map(({ component, name }) => `${JSON.stringify(name)}: ${component}`).join(', ')} };`,
  ].join('\n');
}

const pageGlobals: Plugin = {
  name: 'nxds-page-globals',
  setup(builder) {
    builder.onResolve({ filter: /^react\/jsx(-dev)?-runtime$/ }, () => ({
      path: JSX_RUNTIME,
    }));
    builder.onResolve({ filter: /^react(-dom(\/client)?)?$/ }, (args) => ({
      path: args.path,
      namespace: 'page-global',
    }));
    builder.onLoad({ filter: /.*/, namespace: 'page-global' }, (args) => ({
      contents: REACT_GLOBALS[args.path],
      loader: 'js',
    }));
  },
};

// Every Slot, Radix's and nxds's, looks through the wrapper a canvas puts
// around each component (src/runtime/slot.ts). The shim itself gets the copy the
// React 18 sources use.
const canvasSlot: Plugin = {
  name: 'nxds-canvas-slot',
  setup(builder) {
    builder.onResolve({ filter: /^@radix-ui\/react-slot$/ }, (args) => {
      if (args.pluginData === CANVAS_SLOT) return undefined;
      if (args.importer !== CANVAS_SLOT) return { path: CANVAS_SLOT };
      return builder.resolve(args.path, {
        kind: args.kind,
        resolveDir: react18Src,
        pluginData: CANVAS_SLOT,
      });
    });
  },
};

// One copy of react-slot, reached only through the shim, so no Slot misses it.
function assertOneSlot(metafile: Metafile) {
  const copies = Object.keys(metafile.inputs).filter((input) =>
    input.includes(`${RADIX_SLOT}/`)
  );
  const importers = Object.entries(metafile.inputs)
    .filter(([, input]) =>
      input.imports.some((imported) => copies.includes(imported.path))
    )
    .map(([file]) => file);
  if (
    copies.length !== 1 ||
    importers.length !== 1 ||
    path.resolve(importers[0] ?? '') !== CANVAS_SLOT
  ) {
    throw new Error(
      `bundle.js: ${RADIX_SLOT} must be bundled once and imported only by src/runtime/slot.ts; found ${copies.join(', ') || 'none'} imported by ${importers.join(', ') || 'nothing'}.`
    );
  }
}

function virtualModules(
  slugs: readonly string[],
  parts: readonly FlatComponent[]
): Plugin {
  const contents: Record<string, () => string> = {
    [EXPORTS_MODULE]: () => exportsModule(slugs),
    [ICONS_MODULE]: iconsModule,
    [ICON_NAMES_MODULE]: iconNamesModule,
    [RECHARTS_MODULE]: rechartsModule,
    [SCHEMA_MODULE]: () =>
      `export const CANVAS_SCHEMA = ${JSON.stringify(canvasSchema(parts))};`,
  };
  return {
    name: 'nxds-virtual-modules',
    setup(builder) {
      builder.onResolve({ filter: /^nxds:/ }, (args) => ({
        path: args.path,
        namespace: 'nxds',
      }));
      builder.onLoad({ filter: /.*/, namespace: 'nxds' }, (args) =>
        args.path === SONNER_THEME_MODULE
          ? {
              contents: sonnerThemeModule(),
              loader: 'tsx',
              resolveDir: path.dirname(SONNER_SOURCE),
            }
          : {
              contents: contents[args.path]?.() ?? '',
              loader: 'ts',
              resolveDir: react18Src,
            }
      );
    },
  };
}

// Every Recharts export, with the typed parts (src/canvas/recharts.ts) taking
// their attributes as typed props.
function rechartsModule() {
  const names = Object.keys(RECHARTS_PARTS);
  return [
    "export * from 'recharts';",
    `import { ${names.map((name) => `${name} as Recharts${name}`).join(', ')} } from 'recharts';`,
    `import { withCanvasProps } from ${JSON.stringify(ATTRIBUTES)};`,
    ...names.map(
      (name) =>
        `export const ${name} = withCanvasProps('Recharts${name}', Recharts${name});`
    ),
  ].join('\n');
}

const SONNER_SOURCE = path.join(
  react18Src,
  'components',
  'sonner',
  'sonner.tsx'
);

// The nxds Toaster's module with its private theme and Sonner's own exports
// opened up, for Nxds.Toast. It imports the same Sonner as the Toaster.
function sonnerThemeModule() {
  return `${readFileSync(SONNER_SOURCE, 'utf8')}\nexport { Sonner, sonnerToast, toasterIcons, toasterThemeVars, useToasterTheme };`;
}

function partsBySlug(parts: readonly FlatComponent[]) {
  const bySlug = new Map<string, string[]>();
  for (const { slug, name } of parts) {
    bySlug.set(slug, [...(bySlug.get(slug) ?? []), name]);
  }
  return bySlug;
}

function bundleHeader(components: readonly string[]) {
  const header = {
    format: 4,
    namespace: NAMESPACE,
    components: components.map((name) => ({ name })),
  };
  return `/* @ds-bundle: ${JSON.stringify(header)} */`;
}

/** `folders` are the component folders, in card order; `parts` every part they export. */
export async function buildBundle(
  folders: readonly { name: string; slug: string }[],
  parts: readonly FlatComponent[]
) {
  const result = await build({
    stdin: {
      contents: `import * as all from '${EXPORTS_MODULE}';\nwindow.${NAMESPACE} = all;`,
      loader: 'ts',
      resolveDir: react18Src,
      sourcefile: 'claude-design-entry.ts',
    },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: true,
    jsx: 'automatic',
    legalComments: 'eof',
    charset: 'utf8',
    define: { 'process.env.NODE_ENV': '"production"' },
    loader: { '.css': 'empty' },
    banner: {
      js: bundleHeader([
        ...folders.map((folder) => folder.name),
        ...CANVAS_PARTS.map((part) => part.name),
      ]),
    },
    plugins: [
      canvasSlot,
      pageGlobals,
      virtualModules(
        folders.map((folder) => folder.slug),
        parts
      ),
      canvasProps(partsBySlug(parts)),
    ],
    logOverride: { 'module-level-directive': 'silent' },
    metafile: true,
  });
  assertOneSlot(result.metafile);
  const [output] = result.outputFiles;
  if (!output) throw new Error('bundle.js: esbuild wrote no output.');
  return { code: output.text, metafile: result.metafile };
}
