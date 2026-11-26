// Lets a script that imports src load the .tsx recipes: `node --import ./scripts/register-tsx.ts`.
// Node loads .ts by stripping types, but not .tsx, so this hook compiles the
// recipes' .tsx with esbuild, as the CLI's bundle does.
import { transformSync } from 'esbuild';
import { readFileSync } from 'node:fs';
import { type LoadHookSync, registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';

const load: LoadHookSync = (url, context, nextLoad) => {
  if (!url.endsWith('.tsx')) return nextLoad(url, context);
  const file = fileURLToPath(url);
  const { code } = transformSync(readFileSync(file, 'utf8'), {
    loader: 'tsx',
    format: 'esm',
    sourcefile: file,
  });
  return { format: 'module', source: code, shortCircuit: true };
};

registerHooks({ load });
