import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const repoRoot = path.resolve(packageRoot, '../..');
const probeDir = path.join(packageRoot, '.dist-typecheck');
const tscBin = path.join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc');

// One probe per public subpath. The @ts-expect-error lines fail when the
// subpath's declarations are emitted as `any`. Collapsible's default slot gets
// `{ open: boolean }`, so lost slot declarations fail too. Drawer's types are
// vaul-vue's, which the build bundles.
const probes = {
  '.': `import { Button, Collapsible, Drawer } from '@nxds/vue';

type CollapsibleSlotProps = Parameters<
  NonNullable<InstanceType<typeof Collapsible>['$slots']['default']>
>[0];

declare const slotProps: CollapsibleSlotProps;
export const open: boolean = slotProps.open;
// @ts-expect-error proves the slot props are not any.
void slotProps.notASlotProp;
// @ts-expect-error proves the components are not any.
export const button: number = Button;
// @ts-expect-error proves the bundled vaul-vue types are not any.
export const drawer: number = Drawer;`,
};

const { exports } = JSON.parse(
  await readFile(path.join(packageRoot, 'package.json'), 'utf8')
);

// Only a stylesheet ships without types; every other subpath needs a probe.
const typedSubpaths = Object.entries(exports).filter(
  ([, target]) => !(typeof target === 'string' && target.endsWith('.css'))
);

for (const [subpath, target] of typedSubpaths) {
  if (!(subpath in probes)) {
    throw new Error(
      `@nxds/vue exports ${subpath} has no probe in scripts/typecheck-dist.mjs.`
    );
  }

  for (const condition of ['import', 'require']) {
    const file =
      typeof target === 'object' ? target[condition]?.types : undefined;
    if (!file) {
      throw new Error(
        `@nxds/vue exports ${subpath} has no ${condition}.types. Give it { import: { types, default }, require: { types, default } }.`
      );
    }
    if (!existsSync(path.join(packageRoot, file))) {
      throw new Error(
        `@nxds/vue exports ${subpath}.${condition}.types -> ${file} is missing. Run @nxds/vue build before this dist typecheck.`
      );
    }
  }
}

for (const subpath of Object.keys(probes)) {
  if (!typedSubpaths.some(([exported]) => exported === subpath)) {
    throw new Error(
      `scripts/typecheck-dist.mjs probes ${subpath}, which @nxds/vue no longer exports.`
    );
  }
}

const probe = `${Object.values(probes).join('\n\n')}\n`;

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
      skipLibCheck: false,
      // @vueuse/core's declarations use the Web Bluetooth globals without a
      // reference directive.
      types: ['web-bluetooth'],
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
