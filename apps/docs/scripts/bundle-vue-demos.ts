// Compiles generated/vue/entry.js, which generate:vue writes, into the bundle
// the live Vue previews load from public/vue-demos/.
// usage: node scripts/bundle-vue-demos.ts
import { toRepoPath, vueSrc } from '@nxds/source-model/roots.mjs';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';
import { build, type Plugin } from 'vite';

import { docsRoot } from './docs-root.mjs';

const generated = path.join(docsRoot, 'generated', 'vue');
const entry = path.join(generated, 'entry.js');
const bundleDir = path.join(docsRoot, 'public', 'vue-demos');

const componentIcons = path.join(vueSrc, 'lib', 'icons');
const iconSets = path.join(vueSrc, 'lib', 'icon-libraries');

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
  plugins: [switchableIcons, vue()],
  resolve: { alias: { '@': vueSrc } },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  build: {
    outDir: bundleDir,
    emptyOutDir: true,
    lib: { entry, formats: ['es'], fileName: 'entry', cssFileName: 'entry' },
  },
});

console.log(`Vue demos bundle -> ${toRepoPath(bundleDir)}`);
