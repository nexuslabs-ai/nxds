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

for (const file of ['dist/index.d.ts', 'dist/index.d.cts']) {
  if (!existsSync(path.join(packageRoot, file))) {
    throw new Error(
      `Missing packages/vue/${file}. Run @nxds/vue build before this dist typecheck.`
    );
  }
}

// Collapsible's default slot gets `{ open: boolean }`. If the bundle loses
// the slot declarations, the slot props become `any` and the
// @ts-expect-error lines fail.
const probe = `import { Button, Collapsible } from '@nxds/vue';

type CollapsibleSlotProps = Parameters<
  NonNullable<InstanceType<typeof Collapsible>['$slots']['default']>
>[0];

declare const slotProps: CollapsibleSlotProps;
const open: boolean = slotProps.open;
// @ts-expect-error proves the slot props are not any.
void slotProps.notASlotProp;
// @ts-expect-error proves the components are not any.
const button: number = Button;

void open;
void button;
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
