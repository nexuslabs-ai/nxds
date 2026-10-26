// components/bundle.js: @nxds/react-18 as ONE classic script. It reads React
// and ReactDOM from the page's globals and assigns `window.Nxds`.
import { react18Src } from '@nxds/source-model/roots.mjs';
import { build, type Plugin } from 'esbuild';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { ICONS } from './icons.ts';
import { NAMESPACE } from './system-index.ts';

const JSX_RUNTIME = path.join(import.meta.dirname, 'jsx-runtime.ts');

/** What each React module the sources import reads from the page. */
const REACT_GLOBALS: Record<string, string> = {
  react: 'module.exports = window.React;',
  'react-dom': 'module.exports = window.ReactDOM;',
  'react-dom/client':
    'module.exports = { createRoot: window.ReactDOM.createRoot, hydrateRoot: window.ReactDOM.hydrateRoot };',
};

const EXPORTS_MODULE = 'nxds:exports';
const ICONS_MODULE = 'nxds:icons';

// The editors need the appearance provider, which the export leaves out.
function componentExports() {
  return readFileSync(path.join(react18Src, 'index.ts'), 'utf8')
    .split('\n')
    .filter((line) => !line.includes("'./index.css'"))
    .filter((line) => !line.includes('./components/appearance/'))
    .join('\n');
}

function exportsModule() {
  return [
    componentExports(),
    `export * as Icons from '${ICONS_MODULE}';`,
    "export * as Recharts from 'recharts';",
  ].join('\n');
}

const TABLER_IMPORT =
  /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'@tabler\/icons-react'/g;

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
    for (const [, names = ''] of source.matchAll(TABLER_IMPORT)) {
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
  return `export { ${ICONS.join(', ')} } from '@tabler/icons-react';`;
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

const virtualModules: Plugin = {
  name: 'nxds-virtual-modules',
  setup(builder) {
    builder.onResolve({ filter: /^nxds:/ }, (args) => ({
      path: args.path,
      namespace: 'nxds',
    }));
    builder.onLoad({ filter: /.*/, namespace: 'nxds' }, (args) => ({
      contents: args.path === ICONS_MODULE ? iconsModule() : exportsModule(),
      loader: 'ts',
      resolveDir: react18Src,
    }));
  },
};

function bundleHeader(components: readonly string[]) {
  const header = {
    format: 4,
    namespace: NAMESPACE,
    components: components.map((name) => ({ name })),
  };
  return `/* @ds-bundle: ${JSON.stringify(header)} */`;
}

export async function buildBundle(components: readonly string[]) {
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
    banner: { js: bundleHeader(components) },
    plugins: [pageGlobals, virtualModules],
    logOverride: { 'module-level-directive': 'silent' },
    metafile: true,
  });
  const [output] = result.outputFiles;
  if (!output) throw new Error('bundle.js: esbuild wrote no output.');
  return { code: output.text, metafile: result.metafile };
}
