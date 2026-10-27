import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const clientEntry = 'components/appearance/provider/index';

// Named after the source path, so each entry's bundled types land at the
// same dist path as its source.
const entries = Object.fromEntries(
  [
    'index',
    'lib/utils',
    clientEntry,
    'components/appearance/provider/server',
  ].map((name) => [name, path.resolve(__dirname, `src/${name}.ts`)])
);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      include: ['src'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.stories.tsx',
        'src/stories/**',
        'src/blocks/**',
        'src/patterns/**',
      ],
      bundleTypes: true,
      outDirs: ['dist', { dir: 'dist', moduleFormat: 'cjs' }],
    }),
  ],
  build: {
    lib: {
      entry: entries,
      name: 'NxdsReact',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
      cssFileName: 'react',
    },
    rollupOptions: {
      external: [
        '@nxds/core',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'embla-carousel-react',
        'react-day-picker',
        'react-resizable-panels',
        'recharts',
        'sonner',
        'vaul',
      ],
      output: {
        banner: (chunk) =>
          chunk.isEntry && chunk.name === clientEntry ? "'use client';" : '',
        globals: {
          '@nxds/core': 'NxdsCore',
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          'embla-carousel-react': 'EmblaCarouselReact',
          'react-day-picker': 'ReactDayPicker',
          'react-resizable-panels': 'ReactResizablePanels',
          recharts: 'Recharts',
          sonner: 'Sonner',
          vaul: 'Vaul',
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false,
  },
});
