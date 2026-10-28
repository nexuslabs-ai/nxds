import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json' with { type: 'json' };

const externalPackages = Object.keys({
  ...pkg.dependencies,
  ...pkg.peerDependencies,
});

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: ['**/*.stories.ts', 'src/stories/**'],
      bundleTypes: true,
      outDirs: ['dist', { dir: 'dist', moduleFormat: 'cjs' }],
      // API Extractor drops `declare var`, which vue-tsc uses for slot props.
      beforeWriteFile: (_filePath, content) => ({
        content: content.replaceAll(
          'declare var __VLS_',
          'declare const __VLS_'
        ),
      }),
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      cssFileName: 'vue',
    },
    rollupOptions: {
      external: (id) =>
        externalPackages.some(
          (name) => id === name || id.startsWith(`${name}/`)
        ),
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
