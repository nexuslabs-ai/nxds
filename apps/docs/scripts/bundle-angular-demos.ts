// Compiles generated/angular/entry.js, which generate:angular writes, ahead of
// time into the bundle the live Angular previews load from public/angular-demos/.
// usage: node scripts/bundle-angular-demos.ts
import angular from '@analogjs/vite-plugin-angular';
import { angularSrc, repoRoot, toRepoPath } from '@nxds/source-model/roots.mjs';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { build, type Plugin } from 'vite';

import { docsRoot } from './docs-root.mjs';

const generated = path.join(docsRoot, 'generated', 'angular');
const entry = path.join(generated, 'entry.js');
const bundleDir = path.join(docsRoot, 'public', 'angular-demos');

const componentIcons = path.join(angularSrc, 'lib', 'icons');
const iconSets = path.join(angularSrc, 'lib', 'icon-libraries');

/**
 * The components' own `lib/icons`, swapped for the module that draws them in
 * the reader's icon library. The icon sets it draws from keep the real file.
 */
const switchableIcons: Plugin = {
  name: 'nxds-switchable-icons',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!importer || importer.startsWith(iconSets)) return null;
    const target = source.startsWith('.')
      ? path.resolve(path.dirname(importer), source)
      : source;
    if (target !== componentIcons && target !== `${componentIcons}.ts`) {
      return null;
    }
    return path.join(generated, 'switchable-icons.js');
  },
};

await build({
  configFile: false,
  logLevel: 'warn',
  root: docsRoot,
  publicDir: false,
  plugins: [
    switchableIcons,
    angular({
      jit: false,
      tsconfig: path.join(generated, 'tsconfig.json'),
      workspaceRoot: repoRoot,
    }),
  ],
  build: {
    outDir: bundleDir,
    emptyOutDir: true,
    lib: { entry, formats: ['es'], fileName: 'entry', cssFileName: 'entry' },
  },
});

// Ahead-of-time output never needs the compiler; the docs CSP has no
// `unsafe-eval` for the JIT compiler to run under.
const partial = readdirSync(bundleDir).find((file) =>
  /ɵɵngDeclare\w+/.test(readFileSync(path.join(bundleDir, file), 'utf8'))
);
if (partial) {
  throw new Error(
    `bundle-angular-demos: ${file(partial)} holds partially compiled Angular code, which needs the JIT compiler.`
  );
}

// The docs page always loads the bundle's stylesheet, so write one even when no demo imports CSS.
const styles = path.join(bundleDir, 'entry.css');
if (!existsSync(styles)) writeFileSync(styles, '');

function file(name: string) {
  return toRepoPath(path.join(bundleDir, name));
}

console.log(`Angular demos bundle -> ${toRepoPath(bundleDir)}`);
