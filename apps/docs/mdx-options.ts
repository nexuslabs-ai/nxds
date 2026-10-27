import type { NextMDXOptions } from '@next/mdx';
import { codeBlockTheme } from '@nxds/react/code-block-theme';
import type { Options } from 'rehype-pretty-code';

const SHIKI_OPTIONS = {
  theme: codeBlockTheme,
  keepBackground: false,
  grid: false,
  // Only fills in a fence that declares no language; an unknown grammar is
  // caught by the plugin's own try/catch.
  defaultLang: { block: 'plaintext' },
} satisfies Options;

export const MDX_OPTIONS = {
  remarkPlugins: ['remark-gfm'],
  // Registered by name, not by import: Turbopack serialises loader options.
  rehypePlugins: ['rehype-slug', ['rehype-pretty-code', SHIKI_OPTIONS]],
  remarkRehypeOptions: {
    footnoteLabelProperties: { className: ['nx:sr-only'] },
  },
} satisfies NonNullable<NextMDXOptions['options']>;
