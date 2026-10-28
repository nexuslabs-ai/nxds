// components/bundle.js: @nxds/react-18 as ONE classic script. It reads React
// and ReactDOM from the page's globals and assigns `window.Nxds`.
import { react18Src } from '@nxds/source-model/roots.mjs';
import { build, type Metafile, type Plugin } from 'esbuild';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { ICONS } from './icons.ts';
import { NAMESPACE } from './system-index.ts';

const JSX_RUNTIME = path.join(import.meta.dirname, 'jsx-runtime.ts');
const CANVAS_SLOT = path.join(import.meta.dirname, 'slot.ts');
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
    "export * as Recharts from 'recharts';",
  ].join('\n');
}

const ICON_IMPORT =
  /(?:import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'@phosphor-icons\/react\/ssr'/g;

// Previews render the docs stories against `Nxds.Icons`, so every icon the
// sources import has to be in it.
function assertIconsCovered() {
  const listed = new Set<string>(ICONS);
  const missing = new Set<string>();
  for (const file of readdirSync(react18Src, {
    recursive: true,
    encoding: 'utf8',
  })) {
    if (!/\.tsx?$/.test(file)) continue;
    const source = readFileSync(path.join(react18Src, file), 'utf8');
    for (const [, names = ''] of source.matchAll(ICON_IMPORT)) {
      for (const name of names
        .split(',')
        .map((entry) => entry.trim().split(/\s+as\s+/)[0])) {
        if (name && !listed.has(name)) missing.add(name);
      }
    }
  }
  if (missing.size > 0) {
    throw new Error(
      `bundle.js: add these icons to src/icons.ts: ${[...missing].join(', ')}.`
    );
  }
}

function iconsModule() {
  return `export { ${ICONS.join(', ')} } from '@phosphor-icons/react/ssr';`;
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
// around each component (src/slot.ts). The shim itself gets the copy the
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
      `bundle.js: ${RADIX_SLOT} must be bundled once and imported only by src/slot.ts; found ${copies.join(', ') || 'none'} imported by ${importers.join(', ') || 'nothing'}.`
    );
  }
}

function virtualModules(slugs: readonly string[]): Plugin {
  return {
    name: 'nxds-virtual-modules',
    setup(builder) {
      builder.onResolve({ filter: /^nxds:/ }, (args) => ({
        path: args.path,
        namespace: 'nxds',
      }));
      builder.onLoad({ filter: /.*/, namespace: 'nxds' }, (args) => ({
        contents:
          args.path === ICONS_MODULE ? iconsModule() : exportsModule(slugs),
        loader: 'ts',
        resolveDir: react18Src,
      }));
    },
  };
}

function bundleHeader(components: readonly string[]) {
  const header = {
    format: 4,
    namespace: NAMESPACE,
    components: components.map((name) => ({ name })),
  };
  return `/* @ds-bundle: ${JSON.stringify(header)} */`;
}

/** `folders` are the component folders, in card order. */
export async function buildBundle(
  folders: readonly { name: string; slug: string }[]
) {
  assertIconsCovered();
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
    banner: { js: bundleHeader(folders.map((folder) => folder.name)) },
    plugins: [
      canvasSlot,
      pageGlobals,
      virtualModules(folders.map((folder) => folder.slug)),
    ],
    logOverride: { 'module-level-directive': 'silent' },
    metafile: true,
  });
  assertOneSlot(result.metafile);
  const [output] = result.outputFiles;
  if (!output) throw new Error('bundle.js: esbuild wrote no output.');
  return { code: output.text, metafile: result.metafile };
}
