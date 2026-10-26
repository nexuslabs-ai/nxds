import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = (value) => fileURLToPath(new URL(value, import.meta.url));
const repo = path('../../');
const toolbar = '/Users/temp/.codex/worktrees/toolbar-tools';
// PR #913 (icon libraries, fonts, Shuffle) until it merges; then point the
// @nxds aliases back at `repo` and drop the icon and font aliases.
const iconsAndFonts =
  '/Users/temp/code/nexus/.claude/worktrees/sweet-proskuriakova-899aff/';
const radix = `${repo}node_modules/@radix-ui`;

// Files from the Dock checkout import Radix too. Point every Radix import at
// this repo's single copy so popovers and dialogs share one layer stack.
const radixAliases = readdirSync(radix)
  .filter((name) => existsSync(`${radix}/${name}/dist/index.mjs`))
  .map((name) => ({
    find: new RegExp(`^@radix-ui/${name}$`),
    replacement: `${radix}/${name}/dist/index.mjs`,
  }));

export default defineConfig({
  root: path('./'),
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      {
        find: '@nexus-toolbar/toolbar',
        replacement: `${toolbar}/packages/react/src/components/toolbar/toolbar.tsx`,
      },
      {
        find: '@nexus-toolbar/tooltip',
        replacement: `${toolbar}/packages/react/src/components/tooltip/tooltip.tsx`,
      },
      {
        find: '@nxds/react/appearance',
        replacement: `${iconsAndFonts}packages/react/src/components/appearance/provider/index.ts`,
      },
      {
        find: '@nxds/react/utils',
        replacement: `${iconsAndFonts}packages/react/src/lib/utils.ts`,
      },
      {
        find: /^@nxds\/react$/,
        replacement: `${iconsAndFonts}packages/react/src/index.ts`,
      },
      {
        find: /^@nxds\/core$/,
        replacement: `${iconsAndFonts}packages/core/src/index.ts`,
      },
      {
        find: '@nxds/icon-sets',
        replacement: `${iconsAndFonts}packages/react/src/lib/icon-libraries/index.ts`,
      },
      // Components import their own icons as `../../lib/icons`; draw them in
      // the icon library the visitor picks.
      {
        find: /^(\.\.\/)+lib\/icons$/,
        replacement: path('./switchable-icons.jsx'),
      },
      {
        find: /^@fontsource-variable\/(.+)$/,
        replacement: `${iconsAndFonts}node_modules/@fontsource-variable/$1`,
      },
      ...radixAliases,
    ],
  },
  optimizeDeps: {
    entries: [
      'index.html',
      'appearance-preview.html',
      'hero-adoption-preview/index.html',
    ],
  },
  server: { fs: { allow: [repo, toolbar, iconsAndFonts] } },
});
