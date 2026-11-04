// dist/theme.js: src/theme-entry.ts bundled with this release's build inputs.
// nxds-cli imports it to theme an export, so it must not carry anything that
// only the build has, such as the TypeScript compiler or Tailwind.
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

import type { ThemeInput, ThemeModule } from './theme.ts';
import type { BakedThemeInput } from './theme-entry.ts';

/** Packages the build uses that theme.js must leave out. */
const BUILD_ONLY = new Set([
  'typescript',
  '@tailwindcss',
  'tailwindcss',
  'lightningcss',
  'postcss',
  'postcss-selector-parser',
  'acorn',
  'esbuild',
  'source-model',
]);

function baked({ reads, stylesheetReads, ...rest }: ThemeInput) {
  const input: BakedThemeInput = {
    ...rest,
    readers: [...reads.readers].map(([name, names]) => [name, [...names]]),
    prefixes: [...reads.prefixes].map(([name, names]) => [name, [...names]]),
    stylesheetReads: [...stylesheetReads].sort(),
  };
  return input;
}

/**
 * Writes `file` and imports its bytes from a `data:` URL, as nxds-cli does.
 * Throws when it bundled a build-only package.
 */
export async function buildThemeModule(
  input: ThemeInput,
  file: string
): Promise<{ module: ThemeModule; bytes: number }> {
  const result = await build({
    entryPoints: [path.join(import.meta.dirname, 'theme-entry.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    write: false,
    metafile: true,
    legalComments: 'none',
    define: { THEME_INPUT: JSON.stringify(baked(input)) },
  });
  const leaked = Object.keys(result.metafile.inputs).filter((input) =>
    input.split('/').some((segment) => BUILD_ONLY.has(segment))
  );
  if (leaked.length > 0) {
    throw new Error(
      `theme.js bundles what only the build has:\n${leaked.map((input) => `  ${input}`).join('\n')}`
    );
  }
  const output = result.outputFiles[0];
  if (!output) throw new Error('theme.js: esbuild wrote no output.');
  writeFileSync(file, output.text);
  const imported = (await import(
    `data:text/javascript;base64,${Buffer.from(output.text).toString('base64')}`
  )) as {
    default: ThemeModule;
  };
  return { module: imported.default, bytes: Buffer.byteLength(output.text) };
}
