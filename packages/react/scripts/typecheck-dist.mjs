import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const repoRoot = path.resolve(packageRoot, '../..');
const probeDir = path.join(packageRoot, '.dist-typecheck');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

const entries = [
  'index',
  'lib/utils',
  'components/code-block/code-block-theme',
  'components/appearance/provider/index',
  'components/appearance/provider/server',
];

for (const entry of entries) {
  for (const extension of ['d.ts', 'd.cts']) {
    const file = `dist/${entry}.${extension}`;
    if (!existsSync(path.join(packageRoot, file))) {
      throw new Error(
        `Missing packages/react/${file}. Run @nxds/react build before this dist typecheck.`
      );
    }
  }
}

// One import per public subpath. If a subpath's types fail to resolve, the
// import is `any` and the @ts-expect-error lines fail.
const probe = `import { Button } from '@nxds/react';
import { cn } from '@nxds/react/utils';
import { codeBlockTheme } from '@nxds/react/code-block-theme';
import { NxdsAppearanceProvider } from '@nxds/react/appearance';
import { createNxdsAppearanceScript } from '@nxds/react/appearance/server';

const className: string = cn('nx:flex');
const themeName: string = codeBlockTheme.name;

// @ts-expect-error proves the root entry is not any.
const button: number = Button;
// @ts-expect-error proves the utils entry is not any.
const merged: number = cn('nx:flex');
// @ts-expect-error proves the code block theme entry is not any.
const theme: number = codeBlockTheme;
// @ts-expect-error proves the appearance entry is not any.
const provider: number = NxdsAppearanceProvider;
// @ts-expect-error proves the appearance server entry is not any.
const script: number = createNxdsAppearanceScript;

void className;
void themeName;
void button;
void merged;
void theme;
void provider;
void script;
`;

await rm(probeDir, { recursive: true, force: true });
await mkdir(probeDir, { recursive: true });
await writeFile(path.join(probeDir, 'probe.ts'), probe);
await writeFile(path.join(probeDir, 'probe.cts'), probe);
await writeFile(
  path.join(probeDir, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020', 'DOM'],
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    },
    include: ['probe.ts', 'probe.cts'],
  })
);

const result = spawnSync(
  process.execPath,
  [tscBin, '--project', path.join(probeDir, 'tsconfig.json')],
  { cwd: repoRoot, stdio: 'inherit' }
);

await rm(probeDir, { recursive: true, force: true });

if (result.error) throw result.error;

process.exit(result.status ?? 1);
