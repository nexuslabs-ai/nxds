// Node loads .ts by stripping types, but not .tsx. These hooks compile the
// recipes' .tsx with esbuild, as the CLI's bundle does, so a script that
// imports src directly, such as the smoke test, runs them. Registered by
// register-tsx.ts.
import { transform } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

interface LoadResult {
  format: string;
  source: string;
  shortCircuit?: boolean;
}

export async function load(
  url: string,
  context: object,
  nextLoad: (url: string, context: object) => Promise<LoadResult>
): Promise<LoadResult> {
  if (!url.endsWith('.tsx')) return nextLoad(url, context);
  const file = fileURLToPath(url);
  const { code } = await transform(await readFile(file, 'utf8'), {
    loader: 'tsx',
    format: 'esm',
    sourcefile: file,
  });
  return { format: 'module', source: code, shortCircuit: true };
}
