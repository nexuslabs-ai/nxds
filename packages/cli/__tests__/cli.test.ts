// @vitest-environment node
import {
  type Catalog,
  catalogSchema,
  catalogThemeField,
  type Font,
} from '@nxds/catalog';
import { writeRegistry } from '@nxds/catalog/scripts/registry.mjs';
import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core/source/lib/appearance-model.ts';
import { FONT_OPTIONS } from '@nxds/core/source/lib/font-options.ts';
import { NXDS_THEME_FIELDS } from '@nxds/core/source/lib/theme-fields.ts';
import { SEMANTIC_TOKEN_REGISTRY } from '@nxds/core/source/lib/token-registry.ts';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { main } from '../src/cli';
import { EXIT_CODES } from '../src/errors';

// The first release `nxds-cli` installs from, as committed for nxds.dev/r.
const RELEASE = catalogSchema.parse(
  JSON.parse(
    readFileSync(
      path.resolve(import.meta.dirname, '../../catalog/releases/0.4.6.json'),
      'utf8'
    )
  )
);

const BUTTON = 'components/button/button.tsx';
// A line the next release changes: Button's icon size.
const ICON_SIZE = 'nx:[&_svg]:size-3.5';

function buttonSource(catalog: Catalog) {
  const button = catalog.items.find((item) => item.name === 'button');
  const file = button?.variants.react?.files.find((f) => f.path === BUTTON);
  if (!file) throw new Error(`${catalog.version} has no ${BUTTON}`);
  return file;
}

/** The next release: the same catalog, with Button's icon size changed. */
function nextRelease(): Catalog {
  const next = structuredClone(RELEASE);
  next.version = '0.4.7';
  const file = buttonSource(next);
  file.content = file.content.replace(ICON_SIZE, 'nx:[&_svg]:size-4');
  return next;
}

// A line the release after that changes: the small size's padding.
const SM_PADDING = 'nx:h-8 nx:px-2.5';
const BUTTON_GROUP_CONTEXT = 'components/button-group/button-group-context.ts';

/**
 * The release after `nextRelease`, with Button's small padding changed too,
 * and a change to another file Button installs.
 */
function laterRelease(): Catalog {
  const later = nextRelease();
  later.version = '0.4.8';
  const file = buttonSource(later);
  file.content = file.content.replace(SM_PADDING, 'nx:h-8 nx:px-2');
  const button = later.items.find((item) => item.name === 'button');
  const context = button?.variants.react?.files.find(
    (f) => f.path === BUTTON_GROUP_CONTEXT
  );
  if (!context) throw new Error(`0.4.8 has no ${BUTTON_GROUP_CONTEXT}`);
  context.content += '\nexport const BUTTON_GROUP_SIZES = 3;\n';
  return later;
}

const NEXT_LAYOUT = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Acme' };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`;

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

/** An app with `files`, and a registry with `releases`. */
function scaffold(files: Record<string, string>, releases: Catalog[]) {
  const root = mkdtempSync(path.join(tmpdir(), 'nxds-cli-test-'));
  roots.push(root);
  const app = path.join(root, 'app');
  const registry = path.join(root, 'registry');
  for (const [file, content] of Object.entries(files)) {
    const target = path.join(app, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, content);
  }
  writeRegistry(registry, releases);
  return { app, registry };
}

/** A fresh Next.js App Router app, and a registry with `releases`. */
function setup(releases: Catalog[] = [RELEASE]) {
  return scaffold(
    {
      'package.json': JSON.stringify({
        name: 'acme',
        dependencies: { next: '^16.0.0', react: '^19.2.0' },
        devDependencies: {
          tailwindcss: '^4.1.0',
          '@tailwindcss/postcss': '^4.1.0',
        },
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./*'] } },
      }),
      'app/layout.tsx': NEXT_LAYOUT,
      'app/globals.css': "@import 'tailwindcss';\n",
    },
    releases
  );
}

const VITE_ENTRY = `import { createRoot } from 'react-dom/client';

import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
`;

const VITE_CONFIG = `import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
});
`;

/** A fresh Vite + React app, and a registry with `releases`. */
function setupVite(releases: Catalog[]) {
  return scaffold(
    {
      'package.json': JSON.stringify({
        name: 'acme',
        dependencies: { react: '^19.2.0' },
        devDependencies: {
          vite: '^7.3.0',
          tailwindcss: '^4.1.0',
          '@tailwindcss/vite': '^4.1.0',
        },
      }),
      'tsconfig.json': JSON.stringify({
        compilerOptions: { paths: { '@/*': ['./src/*'] } },
      }),
      'src/main.tsx': VITE_ENTRY,
      'vite.config.ts': VITE_CONFIG,
    },
    releases
  );
}

type Context = { app: string; registry: string };

const INSTALL_COMMANDS = new Set(['init', 'add', 'update']);

/** Runs the CLI in `app` against the test registry, without npm installs. */
async function cli(args: string[], { app, registry }: Context) {
  const argv = [...args, '--cwd', app, '--registry', registry];
  if (INSTALL_COMMANDS.has(args[0] ?? '')) argv.push('--no-install');
  let stdout = '';
  let stderr = '';
  const exitCode = await main(argv, {
    out: (text) => (stdout += text),
    err: (text) => (stderr += text),
  });
  return { exitCode, stdout, stderr };
}

async function cliJson(args: string[], context: Context) {
  const run = await cli([...args, '--json'], context);
  return { exitCode: run.exitCode, body: JSON.parse(run.stdout) };
}

function readApp(app: string, file: string) {
  return readFileSync(path.join(app, file), 'utf8');
}

function writeApp(app: string, file: string, content: string) {
  writeFileSync(path.join(app, file), content);
}

/** Every file under the app, by path, for comparing before and after. */
function readTree(app: string) {
  return Object.fromEntries(
    readdirSync(app, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const file = path.join(entry.parentPath, entry.name);
        return [path.relative(app, file), readFileSync(file, 'utf8')];
      })
  );
}

const NXDS_BUTTON = `components/nxds/${BUTTON}`;
const NXDS_CONTEXT = `components/nxds/${BUTTON_GROUP_CONTEXT}`;

async function installButton(context: Context) {
  for (const args of [['init'], ['add', 'button']]) {
    const run = await cli(args, context);
    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
  }
}

function nxdsVersion(app: string) {
  return (JSON.parse(readApp(app, 'nxds.json')) as { version: string }).version;
}

describe('init and add', () => {
  it('changes nothing when init runs again', async () => {
    const context = setup();
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);
    const before = readTree(context.app);

    const again = await cli(['init'], context);

    expect(again.exitCode).toBe(EXIT_CODES.ok);
    expect(readTree(context.app)).toEqual(before);
  });

  it('keeps a file you edited when add runs again', async () => {
    const context = setup();
    await installButton(context);
    const edited = `${readApp(context.app, NXDS_BUTTON)}\nexport const edited = true;\n`;
    writeApp(context.app, NXDS_BUTTON, edited);

    const { exitCode, body } = await cliJson(['add', 'button'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.skipped).toContain(BUTTON);
    expect(readApp(context.app, NXDS_BUTTON)).toBe(edited);
  });
});

describe('update', () => {
  it('treats line endings and trailing whitespace as unedited', async () => {
    const context = setup();
    await installButton(context);
    const crlf = readApp(context.app, NXDS_BUTTON)
      .split('\n')
      .map((line) => `${line}  `)
      .join('\r\n');
    writeApp(context.app, NXDS_BUTTON, crlf);
    writeRegistry(context.registry, [RELEASE, nextRelease()]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({
      written: [BUTTON],
      merged: [],
      skipped: [],
    });
    expect(readApp(context.app, NXDS_BUTTON)).toBe(
      buttonSource(nextRelease()).content
    );
    expect(nxdsVersion(context.app)).toBe('0.4.7');
  });

  it("merges nxds's changes into lines you didn't edit", async () => {
    const context = setup();
    await installButton(context);
    const edited = readApp(context.app, NXDS_BUTTON).replace(
      "'use client';",
      "'use client';\n// Acme: buttons follow the brand guide."
    );
    writeApp(context.app, NXDS_BUTTON, edited);
    writeRegistry(context.registry, [RELEASE, nextRelease()]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.merged).toEqual([BUTTON]);
    const merged = readApp(context.app, NXDS_BUTTON);
    expect(merged).toContain('// Acme: buttons follow the brand guide.');
    expect(merged).toContain('nx:[&_svg]:size-4');
    expect(merged).not.toContain('<<<<<<<');
    expect(nxdsVersion(context.app)).toBe('0.4.7');
  });

  it('writes conflict markers where you and nxds changed the same line', async () => {
    const context = setup();
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(ICON_SIZE, 'nx:[&_svg]:size-5')
    );
    writeRegistry(context.registry, [RELEASE, nextRelease()]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body).toMatchObject({ ok: false, exitCode: EXIT_CODES.attention });
    expect(body.data.conflicted).toEqual([BUTTON]);
    const conflicted = readApp(context.app, NXDS_BUTTON);
    expect(conflicted).toContain('<<<<<<< your file');
    expect(conflicted).toContain('>>>>>>> nxds 0.4.7');
    expect(nxdsVersion(context.app)).toBe('0.4.7');

    const doctor = await cliJson(['doctor'], context);
    expect(doctor.body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'conflicts', ok: false })
    );
  });

  it('keeps reporting a conflict until you resolve it', async () => {
    const context = setup();
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(ICON_SIZE, 'nx:[&_svg]:size-5')
    );
    writeRegistry(context.registry, [RELEASE, nextRelease()]);
    await cli(['update'], context);
    const conflicted = readApp(context.app, NXDS_BUTTON);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data).toMatchObject({ conflicted: [], unresolved: [BUTTON] });
    expect(readApp(context.app, NXDS_BUTTON)).toBe(conflicted);
  });

  it("changes nothing until you resolve a conflict, then merges the next release's changes", async () => {
    const context = setup();
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(ICON_SIZE, 'nx:[&_svg]:size-5')
    );
    writeRegistry(context.registry, [RELEASE, nextRelease()]);
    await cli(['update'], context);
    writeRegistry(context.registry, [RELEASE, nextRelease(), laterRelease()]);
    const before = readTree(context.app);

    const held = await cliJson(['update'], context);

    expect(held.exitCode).toBe(EXIT_CODES.attention);
    expect(held.body.data).toMatchObject({
      version: '0.4.7',
      written: [],
      merged: [],
      conflicted: [],
      unresolved: [BUTTON],
      orphaned: [],
    });
    expect(readTree(context.app)).toEqual(before);

    // Keep your side of the conflict.
    const resolved = buttonSource(nextRelease()).content.replace(
      'nx:[&_svg]:size-4',
      'nx:[&_svg]:size-5'
    );
    writeApp(context.app, NXDS_BUTTON, resolved);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({
      merged: [BUTTON],
      written: [BUTTON_GROUP_CONTEXT],
    });
    const merged = readApp(context.app, NXDS_BUTTON);
    expect(merged).toContain('nx:[&_svg]:size-5');
    expect(merged).toContain('nx:h-8 nx:px-2 nx:gap-2');
    expect(nxdsVersion(context.app)).toBe('0.4.8');
  });
  it('changes nothing while a file the next release drops is still conflicted', async () => {
    const context = setup();
    await installButton(context);
    const conflicted = `<<<<<<< your file\n${readApp(context.app, NXDS_CONTEXT)}=======\n>>>>>>> nxds 0.4.6\n`;
    writeApp(context.app, NXDS_CONTEXT, conflicted);
    const dropped = nextRelease();
    const button = dropped.items.find((item) => item.name === 'button');
    if (!button?.variants.react) throw new Error('0.4.7 has no button');
    button.variants.react.files = button.variants.react.files.filter(
      (file) => file.path !== BUTTON_GROUP_CONTEXT
    );
    writeRegistry(context.registry, [RELEASE, dropped]);
    const before = readTree(context.app);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.unresolved).toEqual([BUTTON_GROUP_CONTEXT]);
    expect(readTree(context.app)).toEqual(before);
  });
});

const REACT_BUTTON = readFileSync(
  path.resolve(import.meta.dirname, '../../react/src', BUTTON),
  'utf8'
);
const REACT_18_BUTTON = readFileSync(
  path.resolve(import.meta.dirname, '../../react-18/src', BUTTON),
  'utf8'
);

/** `version` with today's Button, and its packages/react-18 copy for React 18. */
function react18Release(version: string): Catalog {
  const release = structuredClone(RELEASE);
  release.version = version;
  release.reactMajors = [18, 19];
  buttonSource(release).content = REACT_BUTTON;
  const button = release.items.find((item) => item.name === 'button');
  if (!button?.variants.react) throw new Error(`${version} has no button`);
  button.variants.react.react18 = {
    files: [{ path: BUTTON, content: REACT_18_BUTTON }],
    packages: { npm: {} },
  };
  return release;
}

function setReact(app: string, range: string) {
  const manifest = JSON.parse(readApp(app, 'package.json'));
  manifest.dependencies.react = range;
  writeApp(app, 'package.json', JSON.stringify(manifest));
}

function nxdsReact(app: string) {
  return (JSON.parse(readApp(app, 'nxds.json')) as { react: number }).react;
}

describe('React 18', () => {
  it('installs the React 18 files in an app on React 18', async () => {
    const context = setup([react18Release('0.4.7')]);
    setReact(context.app, '^18.3.1');

    await installButton(context);

    expect(readApp(context.app, NXDS_BUTTON)).toBe(REACT_18_BUTTON);
    expect(readApp(context.app, NXDS_BUTTON)).toContain('React.forwardRef');
    expect(nxdsReact(context.app)).toBe(18);
  });

  it('installs the React 19 files from the same release on React 19', async () => {
    const context = setup([react18Release('0.4.7')]);

    await installButton(context);

    expect(readApp(context.app, NXDS_BUTTON)).toBe(REACT_BUTTON);
    expect(nxdsReact(context.app)).toBe(19);
  });

  it.each([['^17.0.2'], ['^18.2.0']])(
    'refuses react %s, below React 18.3',
    async (range) => {
      const context = setup([react18Release('0.4.7')]);
      setReact(context.app, range);

      const run = await cli(['init'], context);

      expect(run.exitCode).toBe(EXIT_CODES.error);
      expect(run.stderr).toMatch(/nxds needs React 18\.3 or 19/);
    }
  );

  it('refuses a release without React 18 files on React 18', async () => {
    const context = setup();
    setReact(context.app, '^18.3.1');

    const run = await cli(['init'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(
      /nxds 0\.4\.6 has no React 18 files\. Upgrade the app to React 19\.$/m
    );
  });

  it('refuses to view the React 19 files on React 18', async () => {
    const context = setup();
    setReact(context.app, '^18.3.1');

    const run = await cli(['view', 'button'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(/nxds 0\.4\.6 has no React 18 files/);
  });

  it('suggests update when a later release has React 18 files', async () => {
    const context = setup();
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);
    writeRegistry(context.registry, [RELEASE, react18Release('0.4.7')]);
    setReact(context.app, '^18.3.1');

    const run = await cli(['view', 'button'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(
      /^nxds 0\.4\.6 has no React 18 files\. Upgrade the app to React 19, or run `npx nxds-cli@latest update` to move to nxds 0\.4\.7, which has React 18 files\.$/m
    );
  });

  it('suggests only React 19 when the app is on the latest release', async () => {
    const context = setup();
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);
    setReact(context.app, '^18.3.1');

    const run = await cli(['view', 'button'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(
      /^nxds 0\.4\.6 has no React 18 files\. Upgrade the app to React 19\.$/m
    );
  });

  it('refuses to add files for the wrong React after React changes', async () => {
    const context = setup([react18Release('0.4.7')]);
    setReact(context.app, '^18.3.1');
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);
    setReact(context.app, '^19.2.0');

    const run = await cli(['add', 'button'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(
      /nxds\.json has React 18 files, and this app uses React 19/
    );
  });

  it('switches the files to React 19, keeping your edits, when the app upgrades', async () => {
    const context = setup([react18Release('0.4.7')]);
    setReact(context.app, '^18.3.1');
    await installButton(context);
    const edited = readApp(context.app, NXDS_BUTTON).replace(
      "'use client';",
      "'use client';\n// Acme: buttons follow the brand guide."
    );
    writeApp(context.app, NXDS_BUTTON, edited);
    setReact(context.app, '^19.2.0');

    const doctor = await cliJson(['doctor'], context);
    expect(doctor.body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'react', ok: false })
    );

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({
      fromReact: 18,
      react: 19,
      merged: [BUTTON],
    });
    const merged = readApp(context.app, NXDS_BUTTON);
    expect(merged).toContain('// Acme: buttons follow the brand guide.');
    expect(merged).not.toContain('React.forwardRef');
    expect(merged).not.toContain('<<<<<<<');
    expect(nxdsReact(context.app)).toBe(19);
  });

  it('writes conflict markers when you edited the lines the switch changes', async () => {
    const context = setup([react18Release('0.4.7')]);
    setReact(context.app, '^18.3.1');
    await installButton(context);
    writeApp(
      context.app,
      NXDS_BUTTON,
      readApp(context.app, NXDS_BUTTON).replace(
        'function Button(propsWithoutRef, forwardedRef)',
        'function AcmeButton(propsWithoutRef, forwardedRef)'
      )
    );
    setReact(context.app, '^19.2.0');

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.conflicted).toEqual([BUTTON]);
    expect(readApp(context.app, NXDS_BUTTON)).toContain('<<<<<<< your file');
    expect(nxdsReact(context.app)).toBe(19);
  });
});

const ICONS = 'lib/icons.ts';
const NXDS_ICONS = `components/nxds/${ICONS}`;
const LUCIDE_ICONS = readFileSync(
  path.resolve(
    import.meta.dirname,
    '../../react/src/lib/icon-libraries/lucide.ts'
  ),
  'utf8'
);
/** A curated font as a release lists it. */
function releaseFont(name: string): Font {
  const font = FONT_OPTIONS.find((option) => option.value === name);
  if (!font) throw new Error(`@nxds/core has no font ${name}`);
  return {
    name,
    category: font.category,
    family: font.family,
    package: font.package,
    range: '^5.3.0',
  };
}
const INTER = releaseFont('inter');
const LORA = releaseFont('lora');
const JETBRAINS_MONO = releaseFont('jetbrains-mono');
const NXDS_THEME = 'app/nxds-theme.ts';

/**
 * The committed release as `version`, with icon libraries, fonts and theme
 * flags to pick from: Tabler, the icons its items carry, first, then Lucide.
 * Its font flags take only the three fonts it lists.
 */
function choicesRelease(version: string): Catalog {
  const release = structuredClone(RELEASE);
  release.version = version;
  const tabler = release.items
    .flatMap((item) => item.variants.react?.files ?? [])
    .find((file) => file.path === ICONS);
  if (!tabler) throw new Error(`${RELEASE.version} has no ${ICONS}`);
  release.iconLibraries = [
    {
      name: 'tabler',
      label: 'Tabler Icons',
      file: tabler,
      npm: { '@tabler/icons-react': '^3.36.1' },
    },
    {
      name: 'lucide',
      label: 'Lucide',
      file: { path: ICONS, content: LUCIDE_ICONS },
      npm: { 'lucide-react': '^1.61.0' },
    },
  ];
  release.fonts = [INTER, LORA, JETBRAINS_MONO];
  release.themeFields = NXDS_THEME_FIELDS.flatMap(
    (field) => catalogThemeField(field) ?? []
  );
  return release;
}

function nxdsJson(app: string) {
  return JSON.parse(readApp(app, 'nxds.json')) as Record<string, unknown>;
}

describe('icon libraries', () => {
  it('draws lib/icons.ts with the library init picks, and installs its package', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    expect((await cli(['init', '--icons', 'lucide'], context)).exitCode).toBe(
      EXIT_CODES.ok
    );

    const { exitCode, body } = await cliJson(['add', 'spinner'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_ICONS)).toBe(LUCIDE_ICONS);
    expect(body.data.packages).toContain('lucide-react@^1.61.0');
    expect(body.data.packages.join(' ')).not.toContain('@tabler/icons-react');
    expect(nxdsJson(context.app)).toMatchObject({ iconLibrary: 'lucide' });
  });

  it('keeps the library when update moves to the next release', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--icons', 'lucide'], context);
    await cli(['add', 'spinner'], context);
    writeRegistry(context.registry, [
      choicesRelease('0.4.7'),
      choicesRelease('0.4.8'),
    ]);

    const { exitCode } = await cliJson(['update'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_ICONS)).toBe(LUCIDE_ICONS);
    expect(nxdsVersion(context.app)).toBe('0.4.8');
  });

  it('switches lib/icons.ts in the installed items when init picks another library', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init'], context);
    await cli(['add', 'spinner'], context);
    expect(nxdsJson(context.app)).toMatchObject({ iconLibrary: 'tabler' });

    const run = await cli(['init', '--icons', 'lucide'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_ICONS)).toBe(LUCIDE_ICONS);
    expect(run.stdout).toMatch(/with Lucide icons/);
  });

  it('goes back to the release default library when init is given an empty --icons', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--icons', 'lucide'], context);
    await cli(['add', 'spinner'], context);

    const run = await cli(['init', '--icons='], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(nxdsJson(context.app)).toMatchObject({ iconLibrary: 'tabler' });
    expect(readApp(context.app, NXDS_ICONS)).toBe(
      choicesRelease('0.4.7').iconLibraries[0]?.file.content
    );
  });

  it('keeps the default library for an app from before icon libraries', async () => {
    const context = setup();
    await cli(['init'], context);
    expect(nxdsJson(context.app)).not.toHaveProperty('iconLibrary');
    writeRegistry(context.registry, [RELEASE, choicesRelease('0.4.7')]);

    expect((await cli(['update'], context)).exitCode).toBe(EXIT_CODES.ok);

    expect(nxdsJson(context.app)).toMatchObject({ iconLibrary: 'tabler' });
  });

  it('exits 2 for an icon library the release does not have', async () => {
    const context = setup([choicesRelease('0.4.7')]);

    const run = await cli(['init', '--icons', 'feather'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toMatch(
      /has no icon library "feather"\. Pick one of: tabler, lucide\./
    );
  });

  it('fails the doctor icons check for a library the release does not have', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      'nxds.json',
      JSON.stringify({ ...nxdsJson(context.app), iconLibrary: 'feather' })
    );

    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'icons',
        ok: false,
        message: expect.stringMatching(/init --icons <library>/),
      })
    );
  });

  it('fails the doctor icons check when the release has no icon libraries', async () => {
    const context = setup();
    await cli(['init'], context);
    writeApp(
      context.app,
      'nxds.json',
      JSON.stringify({ ...nxdsJson(context.app), iconLibrary: 'lucide' })
    );

    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'icons',
        ok: false,
        message: expect.stringMatching(/has no icon libraries/),
      })
    );
  });
});

describe('theme', () => {
  it('sets the whole theme init is given, in one step', async () => {
    const context = setup([choicesRelease('0.4.7')]);

    const { exitCode, body } = await cliJson(
      [
        'init',
        '--brand-color',
        '#4f46e5',
        '--density',
        'compact',
        '--font',
        'inter',
        '--heading-font',
        'lora',
        '--code-font',
        'jetbrains-mono',
        '--icons',
        'lucide',
      ],
      context
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    const theme = readApp(context.app, NXDS_THEME);
    expect(theme).toContain("brandColor: '#4f46e5',");
    expect(theme).toContain("density: 'compact',");
    expect(theme).toContain(`uiFont: '${INTER.family}',`);
    expect(theme).toContain(`headingFont: '${LORA.family}',`);
    expect(theme).toContain(`codeFont: '${JETBRAINS_MONO.family}',`);
    expect(readApp(context.app, 'app/appearance-state.ts')).toContain(
      "import { nxdsTheme } from './nxds-theme';"
    );
    expect(nxdsJson(context.app)).toMatchObject({
      iconLibrary: 'lucide',
      theme: {
        'brand-color': '#4f46e5',
        density: 'compact',
        font: 'inter',
        'heading-font': 'lora',
        'code-font': 'jetbrains-mono',
      },
    });
    const css = readApp(context.app, 'app/nxds.css');
    expect(css).toContain(`@import '${INTER.package}';`);
    expect(css).toContain(`@import '${LORA.package}';`);
    expect(css).toContain(`@import '${JETBRAINS_MONO.package}';`);
    expect(body.data.packages).toEqual(
      expect.arrayContaining([
        `${INTER.package}@^5.3.0`,
        `${LORA.package}@^5.3.0`,
        `${JETBRAINS_MONO.package}@^5.3.0`,
      ])
    );
  });

  it('keeps the parts of the theme a later init leaves out', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--density', 'compact', '--font', 'inter'], context);

    const run = await cli(['init', '--corners', 'round'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    const theme = readApp(context.app, NXDS_THEME);
    expect(theme).toContain("density: 'compact',");
    expect(theme).toContain("corners: 'round',");
    expect(theme).toContain(`uiFont: '${INTER.family}',`);
    expect(nxdsJson(context.app)['theme']).toEqual({
      density: 'compact',
      corners: 'round',
      font: 'inter',
    });
  });

  it('changes nothing when init runs again with the same theme', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--density', 'compact', '--font', 'inter'], context);
    const before = readTree(context.app);

    const { exitCode, body } = await cliJson(
      ['init', '--density', 'compact'],
      context
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({ created: [], edited: [] });
    expect(readTree(context.app)).toEqual(before);
  });

  it('moves the CSS to the new font, and doctor names the old package', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--font', 'inter'], context);
    const pkg = JSON.parse(readApp(context.app, 'package.json'));
    pkg.dependencies[INTER.package] = INTER.range;
    writeApp(context.app, 'package.json', JSON.stringify(pkg));

    const run = await cli(['init', '--font', 'lora'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    const css = readApp(context.app, 'app/nxds.css');
    expect(css).toContain(`@import '${LORA.package}';`);
    expect(css).not.toContain(INTER.package);
    const { body } = await cliJson(['doctor'], context);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'fonts',
        ok: false,
        message: expect.stringContaining(`npm uninstall ${INTER.package}`),
      })
    );
  });

  it('leaves the fonts to the theme when add installs a component', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--font', 'inter'], context);

    const { exitCode, body } = await cliJson(['add', 'spinner'], context);

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.cssImports).toEqual([]);
    expect(body.data.packages.join(' ')).not.toContain('@fontsource');
  });

  it('asks an existing appearance-state.ts to spread the theme', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      'app/appearance-state.ts',
      "import { DEFAULT_NXDS_APPEARANCE } from '@nxds/core';\n\nexport const defaultAppearance = DEFAULT_NXDS_APPEARANCE;\n"
    );

    const run = await cli(['init', '--density', 'compact'], context);

    expect(run.exitCode).toBe(EXIT_CODES.attention);
    expect(run.stdout).toContain(
      "app/appearance-state.ts: Spread nxdsTheme from './nxds-theme' into defaultAppearance"
    );
    expect(readApp(context.app, NXDS_THEME)).toContain("density: 'compact',");
  });

  it('fails the doctor theme check when nxds-theme.ts was edited', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--density', 'compact'], context);
    writeApp(
      context.app,
      NXDS_THEME,
      readApp(context.app, NXDS_THEME).replace("'compact'", "'spacious'")
    );

    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'theme',
        ok: false,
        message: expect.stringMatching(/differs from the theme in nxds\.json/),
      })
    );
  });

  it("writes the font family the app's release lists", async () => {
    const release = choicesRelease('0.4.7');
    const inter = { ...INTER, family: '"Inter Variable", sans-serif' };
    release.fonts = [inter, LORA, JETBRAINS_MONO];
    const context = setup([release]);

    const run = await cli(['init', '--font', 'inter'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_THEME)).toContain(
      `uiFont: '"Inter Variable", sans-serif',`
    );
    expect(readApp(context.app, 'app/nxds.css')).toContain(
      `@import '${INTER.package}';`
    );
  });

  it("writes each flag it is given over the release's default appearance", async () => {
    const context = setup([choicesRelease('0.4.7')]);

    const run = await cli(
      ['init', '--density', 'default', '--font', 'system'],
      context
    );

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    const theme = readApp(context.app, NXDS_THEME);
    expect(theme).toContain("density: 'default',");
    expect(theme).toContain(
      `uiFont: '${DEFAULT_NXDS_APPEARANCE.prefs.uiFont}',`
    );
  });

  it("takes the values and ranges the app's release lists", async () => {
    const release = choicesRelease('0.4.7');
    release.themeFields = release.themeFields.map((field) => {
      if (field.flag === 'density') {
        return { ...field, kind: 'choice', values: ['default', 'roomy'] };
      }
      if (field.flag === 'code-font-size') {
        return { ...field, kind: 'integer', min: 8, max: 40 };
      }
      return field;
    });
    const context = setup([release]);

    const run = await cli(
      ['init', '--density', 'roomy', '--code-font-size', '36'],
      context
    );

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    const theme = readApp(context.app, NXDS_THEME);
    expect(theme).toContain("density: 'roomy',");
    expect(theme).toContain('codeFontSize: 36,');
  });

  it('resets a part of the theme an empty flag names', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--density', 'compact', '--font', 'inter'], context);

    const run = await cli(['init', '--density='], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(nxdsJson(context.app)['theme']).toEqual({ font: 'inter' });
    expect(readApp(context.app, NXDS_THEME)).not.toContain('density:');
  });

  it("exits 2 for a value the app's release doesn't take", async () => {
    const release = choicesRelease('0.4.7');
    release.themeFields = release.themeFields.map((field) =>
      field.flag === 'density'
        ? { ...field, kind: 'choice', values: ['compact', 'default'] }
        : field
    );
    const context = setup([release]);

    const run = await cli(['init', '--density', 'spacious'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toMatch(
      /--density "spacious" isn't one of compact, default\./
    );
  });

  it('replaces a bad value in nxds.json with the flag init is given', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      'nxds.json',
      JSON.stringify({ ...nxdsJson(context.app), theme: { density: 'roomy' } })
    );

    const run = await cli(['init', '--density', 'compact'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(nxdsJson(context.app)['theme']).toEqual({ density: 'compact' });
  });

  it('fails the doctor theme check for a key that is no theme flag', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      'nxds.json',
      JSON.stringify({ ...nxdsJson(context.app), theme: { densty: 'compact' } })
    );

    const { body } = await cliJson(['doctor'], context);
    const theme = body.data.checks.find(
      (check: { name: string }) => check.name === 'theme'
    );

    expect(theme).toMatchObject({
      ok: false,
      message: expect.stringMatching(
        /"densty" isn't a theme flag nxds 0\.4\.7 takes\. Remove it/
      ),
    });
    expect(theme.message).not.toContain('init --densty');
  });

  it('fails the doctor theme check for an empty value in nxds.json', async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      'nxds.json',
      JSON.stringify({ ...nxdsJson(context.app), theme: { density: '' } })
    );

    const { body } = await cliJson(['doctor'], context);

    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'theme',
        ok: false,
        message: expect.stringMatching(/--density "" isn't one of/),
      })
    );
  });

  it('takes a release whose theme fields include a kind this version does not know', async () => {
    const release = choicesRelease('0.4.7');
    Object.assign(release, {
      themeFields: [
        ...release.themeFields,
        { flag: 'motion', key: 'motion', kind: 'curve' },
      ],
    });
    const context = setup([release]);

    const run = await cli(['init', '--density', 'compact'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_THEME)).toContain("density: 'compact',");
  });

  it("fails the doctor fonts check when the theme's fonts aren't imported", async () => {
    const context = setup([choicesRelease('0.4.7')]);
    await cli(['init', '--font', 'inter', '--heading-font', 'lora'], context);
    writeApp(
      context.app,
      'app/nxds.css',
      readApp(context.app, 'app/nxds.css')
        .replace(`@import '${INTER.package}';`, '')
        .replace(`@import '${LORA.package}';`, '')
    );

    const { body } = await cliJson(['doctor'], context);

    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'fonts',
        ok: false,
        message: expect.stringContaining(
          `app/nxds.css doesn't import ${INTER.package}, ${LORA.package}, which the theme uses. Run \`npx nxds-cli@latest init\` to import them.`
        ),
      })
    );
  });

  it.each([
    ['--density', 'roomy', /--density "roomy" isn't one of .*compact/],
    ['--font', 'jetbrains-mono', /--font "jetbrains-mono" isn't one of system/],
    ['--code-font', 'inter', /--code-font "inter" isn't one of system/],
    ['--font', 'geist', /--font "geist" isn't one of system, inter, lora\./],
  ])('exits 2 for %s %s', async (flag, value, message) => {
    const context = setup([choicesRelease('0.4.7')]);

    const run = await cli(['init', flag, value], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toMatch(message);
  });
});

/** `choicesRelease`, from a nxds whose provider takes `deriveColors`. */
function ownColorsRelease(version: string): Catalog {
  return { ...choicesRelease(version), ownColors: true };
}

const NXDS_ENTRY = 'app/nxds.css';
const NXDS_COLORS = 'app/nxds-colors.css';
const COLORS_IMPORT = "@import './nxds-colors.css';";
const DERIVE_COLORS_OFF = 'deriveColors={false}';
const OWN_COLORS_PROPS = `storageKey="nxds-appearance" defaultState={defaultAppearance} ${DERIVE_COLORS_OFF}`;
const NEXT_LAYOUT_FILE = 'app/layout.tsx';

/** The nxds colors each mode's block of a colors file sets, by name. */
function declaredColors(css: string) {
  return css
    .split('\n  .dark {')
    .map((block) =>
      [...block.matchAll(/--nx-color-([a-z0-9-]+):/g)].map(([, name]) => name)
    );
}

function colorValue(css: string, name: string) {
  return new RegExp(`--nx-color-${name}: ([^;]+);`).exec(css)?.[1];
}

/** Rewrites the nxds CSS entry with double quotes, as a formatter does. */
function requoteEntry(app: string) {
  const requoted = readApp(app, NXDS_ENTRY).replaceAll("'", '"');
  writeApp(app, NXDS_ENTRY, requoted);
  return requoted;
}

describe('own colors', () => {
  it('writes every color and turns derivation off, in one step', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    const everyColor = SEMANTIC_TOKEN_REGISTRY.map((token) => token.name);
    expect(declaredColors(readApp(context.app, NXDS_COLORS))).toEqual([
      everyColor,
      everyColor,
    ]);
    expect(readApp(context.app, NXDS_ENTRY)).toContain(COLORS_IMPORT);
    const layout = readApp(context.app, NEXT_LAYOUT_FILE);
    expect(layout).toContain(`<NxdsAppearanceProvider ${OWN_COLORS_PROPS}>`);
    expect(layout).toContain(`<NxdsAppearanceScript ${OWN_COLORS_PROPS} />`);
  });

  it('seeds the colors from the theme', async () => {
    const plain = setup([ownColorsRelease('0.4.7')]);
    const blue = setup([ownColorsRelease('0.4.7')]);

    await cli(['init', '--own-colors'], plain);
    await cli(['init', '--own-colors', '--brand-color', '#1976d2'], blue);

    const primary = (app: string) =>
      colorValue(readApp(app, NXDS_COLORS), 'primary-background');
    expect(primary(blue.app)).toBeDefined();
    expect(primary(blue.app)).not.toBe(primary(plain.app));
  });

  it('turns derivation off in an app that already renders the provider', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init'], context);
    expect(readApp(context.app, NEXT_LAYOUT_FILE)).not.toContain(
      DERIVE_COLORS_OFF
    );

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    const layout = readApp(context.app, NEXT_LAYOUT_FILE);
    expect(layout).toContain(`<NxdsAppearanceProvider ${OWN_COLORS_PROPS}>`);
    expect(layout).toContain(`<NxdsAppearanceScript ${OWN_COLORS_PROPS} />`);
    expect(readApp(context.app, NXDS_ENTRY)).toContain(COLORS_IMPORT);
    expect(
      colorValue(readApp(context.app, NXDS_COLORS), 'primary-background')
    ).toBeDefined();
  });

  it('changes nothing when init runs again, and keeps a color you edited', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    writeApp(
      context.app,
      NXDS_COLORS,
      readApp(context.app, NXDS_COLORS).replace(
        /--nx-color-primary-background: [^;]+;/,
        '--nx-color-primary-background: #1976d2;'
      )
    );
    const before = readTree(context.app);

    const again = await cli(['init', '--own-colors'], context);

    expect(again.exitCode).toBe(EXIT_CODES.ok);
    expect(readTree(context.app)).toEqual(before);
  });

  it('leaves a provider in another file as a step for you', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      NEXT_LAYOUT_FILE,
      readApp(context.app, NEXT_LAYOUT_FILE)
        .replace(/<NxdsAppearanceProvider [^>]*>/, '<Providers>')
        .replace('</NxdsAppearanceProvider>', '</Providers>')
    );

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode).toBe(EXIT_CODES.attention);
    expect(run.stdout).toContain(
      `${NEXT_LAYOUT_FILE}: Pass ${DERIVE_COLORS_OFF} to NxdsAppearanceProvider.`
    );
    expect(readApp(context.app, NEXT_LAYOUT_FILE)).toContain(
      `<NxdsAppearanceScript ${OWN_COLORS_PROPS} />`
    );
  });

  it('exits 2 on a release from before own colors', async () => {
    const context = setup([choicesRelease('0.4.7')]);

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toContain('nxds 0.4.7 has no --own-colors');
    expect(readTree(context.app)).not.toHaveProperty([NXDS_COLORS]);
  });

  it('passes the doctor colors check, and fails it once the provider derives again', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);

    const wired = await cliJson(['doctor'], context);
    expect(wired.body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'colors', ok: true })
    );

    writeApp(
      context.app,
      NEXT_LAYOUT_FILE,
      readApp(context.app, NEXT_LAYOUT_FILE).replace(
        ` ${DERIVE_COLORS_OFF}>`,
        '>'
      )
    );
    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'colors',
        ok: false,
        message: expect.stringMatching(
          /still derives colors in app\/layout\.tsx/
        ),
      })
    );
  });

  it('runs no doctor colors check for an app whose colors are derived', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init'], context);

    const { body } = await cliJson(['doctor'], context);

    expect(body.data.checks).not.toContainEqual(
      expect.objectContaining({ name: 'colors' })
    );
  });

  it('fails the doctor colors check when the colors file lacks a color nxds.css sets', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    writeApp(
      context.app,
      NXDS_COLORS,
      readApp(context.app, NXDS_COLORS).replaceAll(
        /\n *--nx-color-primary-background-hover: [^;]+;/g,
        ''
      )
    );

    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'colors',
        ok: false,
        message: expect.stringMatching(
          /nxds colors\. Add primary-background-hover under :root\. Add primary-background-hover under \.dark\.$/
        ),
      })
    );
  });

  it('fails the doctor colors check when only the dark block lacks a color', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    writeApp(
      context.app,
      NXDS_COLORS,
      readApp(context.app, NXDS_COLORS).replace(
        /(\.dark \{[\s\S]*?)\n *--nx-color-primary-background-hover: [^;]+;/,
        '$1'
      )
    );

    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'colors',
        ok: false,
        message: expect.stringMatching(
          /nxds colors\. Add primary-background-hover under \.dark\.$/
        ),
      })
    );
  });

  it.each([
    {
      edit: 'a statement above :root names .dark',
      rewrite: (css: string) =>
        css.replace(
          '  :root {',
          '  @custom-variant dark (&:where(.dark, .dark *));\n  :root {'
        ),
    },
    {
      edit: 'the light rule is :root:not(.dark)',
      rewrite: (css: string) =>
        css.replace('  :root {', '  :root:not(.dark) {'),
    },
    {
      edit: 'the dark rule is nested in :root',
      rewrite: (css: string) =>
        `${css.replace('  }\n\n  .dark {', '  &.dark {')}}\n`,
    },
  ])('passes the doctor colors check when $edit', async ({ rewrite }) => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    const written = readApp(context.app, NXDS_COLORS);
    const edited = rewrite(written);
    expect(edited).not.toBe(written);
    writeApp(context.app, NXDS_COLORS, edited);

    const { body } = await cliJson(['doctor'], context);

    expect(body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'colors', ok: true })
    );
  });

  it('fails the doctor colors check, and runs the rest, when the layout does not parse', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    writeApp(
      context.app,
      NEXT_LAYOUT_FILE,
      readApp(context.app, NEXT_LAYOUT_FILE).replace('</body>', '')
    );

    const { exitCode, body } = await cliJson(['doctor'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'colors',
        ok: false,
        message: expect.stringMatching(/Could not parse app\/layout\.tsx/),
      })
    );
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'files' })
    );
  });

  it('adds no second import when a formatter requoted the first', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    const requoted = requoteEntry(context.app);

    const again = await cli(['init', '--own-colors'], context);

    expect(again.exitCode, again.stdout + again.stderr).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_ENTRY)).toBe(requoted);
  });

  it('runs the doctor colors check on a requoted import', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    requoteEntry(context.app);

    const { body } = await cliJson(['doctor'], context);

    expect(body.data.checks).toContainEqual(
      expect.objectContaining({ name: 'colors', ok: true })
    );
  });

  it('exits 2 on a color flag once the app owns its colors', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init', '--own-colors'], context);
    const before = readTree(context.app);

    const run = await cli(['init', '--brand-color', '#1976d2'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toContain(
      `${NXDS_COLORS} sets your colors, so --brand-color would change nothing`
    );
    expect(readTree(context.app)).toEqual(before);
  });

  it('leaves a provider that sets deriveColors itself as a step for you, and fails doctor on it', async () => {
    const context = setup([ownColorsRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      NEXT_LAYOUT_FILE,
      readApp(context.app, NEXT_LAYOUT_FILE).replace(
        /(<NxdsAppearanceProvider [^>]*)>/,
        '$1 deriveColors={derive}>'
      )
    );

    const run = await cli(['init', '--own-colors'], context);
    const { body } = await cliJson(['doctor'], context);

    expect(run.exitCode).toBe(EXIT_CODES.attention);
    expect(run.stdout).toContain(
      `${NEXT_LAYOUT_FILE}: Change deriveColors to ${DERIVE_COLORS_OFF} on NxdsAppearanceProvider.`
    );
    expect(body.data.checks).toContainEqual(
      expect.objectContaining({
        name: 'colors',
        ok: false,
        message: expect.stringMatching(
          /still derives colors in app\/layout\.tsx/
        ),
      })
    );
  });

  it('wires a new Vite app, theme script included', async () => {
    const context = setupVite([ownColorsRelease('0.4.7')]);

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, 'nxds.vite.ts')).toContain(
      'deriveColors: false'
    );
    expect(readApp(context.app, 'src/main.tsx')).toContain(
      `<NxdsAppearanceProvider ${OWN_COLORS_PROPS}>`
    );
    expect(readApp(context.app, 'src/nxds.css')).toContain(COLORS_IMPORT);
    expect(
      colorValue(
        readApp(context.app, 'src/nxds-colors.css'),
        'primary-background'
      )
    ).toBeDefined();
  });

  it('turns derivation off in a Vite theme script init wrote earlier', async () => {
    const context = setupVite([ownColorsRelease('0.4.7')]);
    await cli(['init'], context);
    expect(readApp(context.app, 'nxds.vite.ts')).not.toContain('deriveColors');

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode, run.stdout + run.stderr).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, 'nxds.vite.ts')).toContain(
      'deriveColors: false'
    );
    expect(readApp(context.app, 'src/main.tsx')).toContain(
      `<NxdsAppearanceProvider ${OWN_COLORS_PROPS}>`
    );
  });

  it('leaves a Vite theme script that sets deriveColors itself as a step for you', async () => {
    const context = setupVite([ownColorsRelease('0.4.7')]);
    await cli(['init'], context);
    writeApp(
      context.app,
      'nxds.vite.ts',
      readApp(context.app, 'nxds.vite.ts').replace(
        'createNxdsAppearanceSnapshotFromState(defaultAppearance)',
        'createNxdsAppearanceSnapshotFromState(defaultAppearance, { deriveColors: true })'
      )
    );

    const run = await cli(['init', '--own-colors'], context);

    expect(run.exitCode).toBe(EXIT_CODES.attention);
    expect(run.stdout).toContain(
      'nxds.vite.ts: Pass { deriveColors: false } as the second argument of createNxdsAppearanceSnapshotFromState.'
    );
  });
});

const WIRING = 'storybook.tsx';
const NXDS_WIRING = `components/nxds/${WIRING}`;
const WIRING_SOURCE = readFileSync(
  path.resolve(import.meta.dirname, '../../react/src/storybook.tsx'),
  'utf8'
);
const BUTTON_STORY = 'components/button/Button.stories.tsx';
const NXDS_BUTTON_STORY = `components/nxds/${BUTTON_STORY}`;
// A story as the release's first icon library, Tabler, draws it. It uses
// Label, which Button itself doesn't need.
const BUTTON_STORY_SOURCE = `import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconPlus } from '@tabler/icons-react';

import { Label } from '../label/label';

import { Button } from './button';

const meta = { component: Button } satisfies Meta<typeof Button>;
export default meta;

export const Default: StoryObj<typeof meta> = {
  render: () => (
    <Label>
      <Button startIcon={<IconPlus />}>Add a member</Button>
    </Label>
  ),
};
`;
const NEXTJS_VITE = '@storybook/nextjs-vite';

/** The edit that turns `from` into `to` in the Button story. */
function storyEdit(from: string, to: string): [number, number, string] {
  const start = BUTTON_STORY_SOURCE.indexOf(from);
  if (start < 0) throw new Error(`The Button story has no ${from}`);
  return [start, start + from.length, to];
}

function reactVariant(release: Catalog, name: string) {
  const variant = release.items.find((item) => item.name === name)?.variants
    .react;
  if (!variant) throw new Error(`${release.version} has no ${name}`);
  return variant;
}

/**
 * `choicesRelease` with stories: setup's brings the Storybook wiring file, and
 * Button's brings its story, which Lucide draws with other icons.
 */
function storiesRelease(version: string): Catalog {
  const release = choicesRelease(version);
  release.storybook = {
    range: '>=10.0.0',
    frameworks: ['@storybook/react-vite', NEXTJS_VITE],
  };
  reactVariant(release, 'setup').stories = {
    items: [],
    packages: { npm: {} },
    files: [{ path: WIRING, content: WIRING_SOURCE }],
  };
  reactVariant(release, 'button').stories = {
    items: ['label'],
    packages: { npm: { '@tabler/icons-react': '^3.36.1' } },
    files: [
      {
        path: BUTTON_STORY,
        content: BUTTON_STORY_SOURCE,
        icons: {
          lucide: [
            storyEdit(
              "import { IconPlus } from '@tabler/icons-react';",
              "import { PlusIcon } from 'lucide-react';"
            ),
            storyEdit('<IconPlus />', '<PlusIcon />'),
          ],
        },
      },
    ],
  };
  return release;
}

const STORYBOOK_MAIN = '.storybook/main.ts';
const STORYBOOK_PREVIEW = '.storybook/preview.ts';
// As `storybook init` writes them, with no semicolon after an import.
const MAIN_SOURCE = `import type { StorybookConfig } from '${NEXTJS_VITE}'

const config: StorybookConfig = {
  "stories": [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": ["@storybook/addon-a11y", "@storybook/addon-docs"],
  "framework": "${NEXTJS_VITE}"
};
export default config;
`;
const PREVIEW_SOURCE = `import type { Preview } from '${NEXTJS_VITE}'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      test: 'todo'
    }
  },
};

export default preview;
`;

/** Adds Storybook to the app, as `storybook init` leaves it. */
function addStorybook(
  app: string,
  packages: Record<string, string> = {
    storybook: '^10.1.0',
    [NEXTJS_VITE]: '^10.1.0',
  }
) {
  const manifest = JSON.parse(readApp(app, 'package.json')) as {
    devDependencies: Record<string, string>;
  };
  Object.assign(manifest.devDependencies, packages);
  writeApp(app, 'package.json', JSON.stringify(manifest));
  mkdirSync(path.join(app, '.storybook'));
  writeApp(app, STORYBOOK_MAIN, MAIN_SOURCE);
  writeApp(app, STORYBOOK_PREVIEW, PREVIEW_SOURCE);
}

const POSTCSS_CONFIG = 'postcss.config.mjs';

/**
 * A Next.js app with Storybook, whose PostCSS config runs Tailwind, and a
 * registry whose releases have stories.
 */
function setupStories(releases: Catalog[] = [storiesRelease('0.4.7')]) {
  const context = setup(releases);
  addStorybook(context.app);
  writeApp(
    context.app,
    POSTCSS_CONFIG,
    "export default { plugins: { '@tailwindcss/postcss': {} } };\n"
  );
  return context;
}

describe('stories', () => {
  it('installs the wiring file and wires Storybook when init is given --stories', async () => {
    const context = setupStories();

    const { exitCode, body } = await cliJson(['init', '--stories'], context);

    expect(exitCode, JSON.stringify(body)).toBe(EXIT_CODES.ok);
    expect(nxdsJson(context.app)).toMatchObject({ stories: true });
    // The wiring imports its types from the app's own Storybook framework.
    expect(readApp(context.app, NXDS_WIRING)).toBe(
      WIRING_SOURCE.replaceAll("'@storybook/react-vite'", `'${NEXTJS_VITE}'`)
    );
    const preview = readApp(context.app, STORYBOOK_PREVIEW);
    for (const line of [
      "import '../app/nxds.css'",
      "import { nxdsPreview } from '../components/nxds/storybook'",
      "import { defaultAppearance } from '../app/appearance-state'",
      'const nxds = nxdsPreview(defaultAppearance)',
      'decorators: nxds.decorators',
      'globalTypes: nxds.globalTypes',
      'initialGlobals: nxds.initialGlobals',
      // The preview's own a11y settings stay, and take nxds's axe rules.
      "test: 'todo'",
      'options: nxds.parameters.a11y.options',
    ]) {
      expect(preview).toContain(line);
    }
    expect(readApp(context.app, STORYBOOK_MAIN)).toContain(
      '"../components/nxds/**/*.stories.tsx"'
    );
  });

  it('changes nothing when init --stories runs again', async () => {
    const context = setupStories();
    await cli(['init', '--stories'], context);
    const before = readTree(context.app);

    const again = await cli(['init', '--stories'], context);

    expect(again.exitCode, again.stdout).toBe(EXIT_CODES.ok);
    expect(readTree(context.app)).toEqual(before);
  });

  it("installs an item's story, and the items and packages the story uses", async () => {
    const context = setupStories();
    await cli(['init', '--stories'], context);

    const { exitCode, body } = await cliJson(['add', 'button'], context);

    expect(exitCode, JSON.stringify(body)).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_BUTTON_STORY)).toBe(
      BUTTON_STORY_SOURCE.replace('@storybook/react-vite', NEXTJS_VITE)
    );
    expect(body.data.items).toContain('label');
    expect(body.data.written).toContain('components/label/label.tsx');
    expect(body.data.packages).toContain('@tabler/icons-react@^3.36.1');
  });

  it('installs no story, and says how to get them, while stories are off', async () => {
    const context = setupStories();
    await cli(['init'], context);

    const run = await cli(['add', 'button'], context);

    expect(run.exitCode, run.stdout).toBe(EXIT_CODES.ok);
    expect(readTree(context.app)).not.toHaveProperty([NXDS_BUTTON_STORY]);
    expect(readTree(context.app)).not.toHaveProperty([NXDS_WIRING]);
    expect(run.stdout).toMatch(/Storybook found\. Run `.* init --stories`/);
  });

  it('gives no stories hint in an app without Storybook', async () => {
    const context = setup([storiesRelease('0.4.7')]);
    await cli(['init'], context);

    const run = await cli(['add', 'button'], context);

    expect(run.stdout).not.toMatch(/--stories/);
  });

  it('installs the stories of the items an app already has when stories turn on', async () => {
    const context = setupStories();
    await installButton(context);

    const run = await cli(['init', '--stories'], context);

    expect(run.exitCode, run.stdout).toBe(EXIT_CODES.ok);
    expect(readApp(context.app, NXDS_BUTTON_STORY)).toContain('Add a member');
    expect(nxdsJson(context.app)).toMatchObject({
      items: expect.arrayContaining(['button', 'label']),
    });
  });

  it("draws a story's icons with the app's icon library", async () => {
    const context = setupStories();
    await cli(['init', '--stories', '--icons', 'lucide'], context);

    const { exitCode, body } = await cliJson(['add', 'button'], context);

    expect(exitCode, JSON.stringify(body)).toBe(EXIT_CODES.ok);
    const story = readApp(context.app, NXDS_BUTTON_STORY);
    expect(story).toContain("import { PlusIcon } from 'lucide-react';");
    expect(story).toContain('<Button startIcon={<PlusIcon />}>');
    expect(story).not.toContain('tabler');
    expect(body.data.packages).toContain('lucide-react@^1.61.0');
    expect(body.data.packages.join(' ')).not.toContain('@tabler/icons-react');
  });

  it("merges the next release's story changes into a story you edited", async () => {
    const context = setupStories();
    await cli(['init', '--stories'], context);
    await cli(['add', 'button'], context);
    writeApp(
      context.app,
      NXDS_BUTTON_STORY,
      readApp(context.app, NXDS_BUTTON_STORY).replace(
        'Add a member',
        'Invite a teammate'
      )
    );
    const next = storiesRelease('0.4.8');
    const [story] = reactVariant(next, 'button').stories?.files ?? [];
    if (!story) throw new Error('0.4.8 has no Button story');
    story.content +=
      '\nexport const Disabled = { args: { disabled: true } };\n';
    writeRegistry(context.registry, [storiesRelease('0.4.7'), next]);

    const { exitCode, body } = await cliJson(['update'], context);

    expect(exitCode, JSON.stringify(body)).toBe(EXIT_CODES.ok);
    expect(body.data.merged).toContain(BUTTON_STORY);
    const merged = readApp(context.app, NXDS_BUTTON_STORY);
    expect(merged).toContain('Invite a teammate');
    expect(merged).toContain('export const Disabled');
  });

  it('leaves the story files and stops tracking them when init is given --no-stories', async () => {
    const context = setupStories();
    await cli(['init', '--stories'], context);
    await cli(['add', 'button'], context);
    const story = `${readApp(context.app, NXDS_BUTTON_STORY)}\n// Edited.\n`;
    writeApp(context.app, NXDS_BUTTON_STORY, story);

    const off = await cli(['init', '--no-stories'], context);

    expect(off.exitCode, off.stdout).toBe(EXIT_CODES.ok);
    expect(off.stdout).not.toMatch(/Storybook found/);
    expect(nxdsJson(context.app)).not.toHaveProperty('stories');
    expect(readApp(context.app, NXDS_BUTTON_STORY)).toBe(story);
    const { body } = await cliJson(['diff'], context);
    expect(
      body.data.files.map((file: { path: string }) => file.path)
    ).not.toContain(BUTTON_STORY);
  });

  it('tracks a story in diff while stories are on', async () => {
    const context = setupStories();
    await cli(['init', '--stories'], context);
    await cli(['add', 'button'], context);
    writeApp(
      context.app,
      NXDS_BUTTON_STORY,
      `${readApp(context.app, NXDS_BUTTON_STORY)}\n// Edited.\n`
    );

    const { body } = await cliJson(['diff'], context);

    expect(body.data.files).toContainEqual(
      expect.objectContaining({ path: BUTTON_STORY, state: 'changed' })
    );
  });

  it('adds only what a preview lacks, and keeps what it sets', async () => {
    const context = setupStories();
    writeApp(
      context.app,
      STORYBOOK_PREVIEW,
      `import { withThemeByClassName } from '@storybook/addon-themes';

export default {
  decorators: [withThemeByClassName({ themes: { light: '', dark: 'dark' } })],
  globalTypes: { locale: { name: 'Locale' } },
};
`
    );

    const run = await cli(['init', '--stories'], context);

    expect(run.exitCode, run.stdout).toBe(EXIT_CODES.ok);
    const preview = readApp(context.app, STORYBOOK_PREVIEW);
    expect(preview).toContain(
      "decorators: [withThemeByClassName({ themes: { light: '', dark: 'dark' } }), ...nxds.decorators]"
    );
    expect(preview).toContain(
      "globalTypes: { ...nxds.globalTypes, locale: { name: 'Locale' } }"
    );
    expect(preview).toContain('initialGlobals: nxds.initialGlobals');
    expect(preview).toContain('parameters: nxds.parameters');
  });

  it('writes a preview for an app that has none', async () => {
    const context = setupStories();
    rmSync(path.join(context.app, STORYBOOK_PREVIEW));

    const { exitCode, body } = await cliJson(['init', '--stories'], context);

    expect(exitCode, JSON.stringify(body)).toBe(EXIT_CODES.ok);
    expect(body.data.created).toContain(STORYBOOK_PREVIEW);
    expect(readApp(context.app, STORYBOOK_PREVIEW)).toContain(
      `import type { Preview } from '${NEXTJS_VITE}';`
    );
  });

  it('leaves a preview it cannot extend as a step for you', async () => {
    const context = setupStories();
    const preview = `import { sharedPreview } from '@acme/storybook';

export default sharedPreview;
`;
    writeApp(context.app, STORYBOOK_PREVIEW, preview);

    const { exitCode, body } = await cliJson(['init', '--stories'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(readApp(context.app, STORYBOOK_PREVIEW)).toBe(preview);
    expect(body.data.manual).toContainEqual(
      expect.objectContaining({
        file: STORYBOOK_PREVIEW,
        step: expect.stringContaining('nxdsPreview'),
      })
    );
  });

  it('leaves main alone when its stories already cover the nxds folder', async () => {
    const context = setupStories();
    const main = MAIN_SOURCE.replace(
      '"../stories/**/*.mdx",',
      '"../components/**/*.stories.@(ts|tsx)",'
    );
    writeApp(context.app, STORYBOOK_MAIN, main);

    await cli(['init', '--stories'], context);

    expect(readApp(context.app, STORYBOOK_MAIN)).toBe(main);
  });

  it("adds Tailwind to Storybook's build when the app's own build keeps it out of sight", async () => {
    const context = setupStories();
    // As Next.js sets Tailwind up for Turbopack: no PostCSS config.
    rmSync(path.join(context.app, POSTCSS_CONFIG));

    const { exitCode, body } = await cliJson(['init', '--stories'], context);

    expect(exitCode, JSON.stringify(body)).toBe(EXIT_CODES.ok);
    const main = readApp(context.app, STORYBOOK_MAIN);
    expect(main).toContain("import tailwindcss from '@tailwindcss/vite'");
    expect(main).toContain(
      'viteFinal: (config) => ({ ...config, plugins: [...(config.plugins ?? []), tailwindcss()] })'
    );
    expect(body.data.packages.join(' ')).toContain('@tailwindcss/vite@');
  });

  it('leaves a main that sets its own viteFinal as a step for you', async () => {
    const context = setupStories();
    rmSync(path.join(context.app, POSTCSS_CONFIG));
    const main = MAIN_SOURCE.replace(
      '"framework"',
      'viteFinal: (config) => config,\n  "framework"'
    );
    writeApp(context.app, STORYBOOK_MAIN, main);

    const { exitCode, body } = await cliJson(['init', '--stories'], context);

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(readApp(context.app, STORYBOOK_MAIN)).not.toContain('tailwindcss');
    expect(body.data.manual).toContainEqual(
      expect.objectContaining({
        file: STORYBOOK_MAIN,
        step: expect.stringContaining('@tailwindcss/vite'),
      })
    );
  });

  it.each([
    ['an app without Storybook', {}, /npx storybook@latest init/],
    [
      'Storybook 9',
      { storybook: '^9.1.0', [NEXTJS_VITE]: '^9.1.0' },
      /need Storybook >=10\.0\.0, and this app has storybook 9\.1\.0/,
    ],
    [
      'a webpack Storybook',
      { storybook: '^10.1.0', '@storybook/nextjs': '^10.1.0' },
      /Vite-based Storybook/,
    ],
  ])('refuses --stories for %s', async (_name, packages, message) => {
    const context = setup([storiesRelease('0.4.7')]);
    addStorybook(context.app, packages);

    const run = await cli(['init', '--stories'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(message);
    expect(readTree(context.app)).not.toHaveProperty(['nxds.json']);
  });

  it('refuses --stories on a release from before stories', async () => {
    const context = setup();
    addStorybook(context.app);

    const run = await cli(['init', '--stories'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(/nxds 0\.4\.6 has no stories/);
  });

  it('passes the doctor stories check, and fails it once the preview drops the wiring', async () => {
    const context = setupStories();
    await cli(['init', '--stories'], context);
    await cli(['add', 'button'], context);
    type Checks = { name: string; ok: boolean; message: string }[];
    const storiesCheck = async () => {
      const { body } = await cliJson(['doctor'], context);
      return (body.data.checks as Checks).find(
        (check) => check.name === 'stories'
      );
    };

    expect(await storiesCheck()).toMatchObject({ ok: true });

    writeApp(context.app, STORYBOOK_PREVIEW, PREVIEW_SOURCE);

    expect(await storiesCheck()).toMatchObject({
      ok: false,
      message: expect.stringContaining(STORYBOOK_PREVIEW),
    });
  });

  it('runs no doctor stories check while stories are off', async () => {
    const context = setupStories();
    await cli(['init'], context);

    const { body } = await cliJson(['doctor'], context);

    expect(
      body.data.checks.map((check: { name: string }) => check.name)
    ).not.toContain('stories');
  });
});

describe('help', () => {
  it.each([[['help', 'add']], [['add', '--help']]])(
    'prints help for %j and exits 0',
    async (args) => {
      const run = await cli(args, setup());

      expect(run.exitCode).toBe(EXIT_CODES.ok);
      expect(run.stdout).toMatch(/add components or blocks/);
      expect(run.stderr).toBe('');
    }
  );
});

describe('errors', () => {
  it('exits 2 with one JSON object for a flag the command does not take', async () => {
    const context = setup();

    const run = await cli(['list', '--overwrite', '--json'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(JSON.parse(run.stdout)).toMatchObject({
      ok: false,
      exitCode: EXIT_CODES.usage,
      error: expect.stringMatching(/unknown option '--overwrite'/),
    });
  });

  it('exits 2 for an item the release does not have', async () => {
    const context = setup();
    expect((await cli(['init'], context)).exitCode).toBe(EXIT_CODES.ok);

    const run = await cli(['add', 'buton'], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toMatch(/has no item named "buton"/);
  });

  it.each([
    ['a user name and password', 'https://user:secret@registry.invalid/r'],
    ['an upper-case scheme', 'HTTPS://user:secret@registry.invalid/r'],
    ['a leading space', ' https://user:secret@registry.invalid/r'],
    ['a slash in the password', 'https://user:secret/1@registry.invalid/r'],
    ['a scheme other than http', 'ftp://user:secret@registry.invalid/r'],
    ['no scheme', 'user:secret@registry.invalid/r'],
    ['a query', 'https://registry.invalid/r?token=secret'],
    ['an empty query', 'https://registry.invalid/r?'],
    ['a fragment', 'https://registry.invalid/r#secret'],
  ])('refuses a --registry URL with %s', async (_, registry) => {
    const { app } = setup();

    const run = await cli(['list'], { app, registry });

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toContain('--registry');
    expect(run.stdout + run.stderr).not.toContain('secret');
  });

  it('ignores a refused --registry URL in a command that does not read it', async () => {
    const { app } = setup();

    const run = await cli(['info'], {
      app,
      registry: 'https://user:secret@registry.invalid/r',
    });

    expect(run.exitCode).toBe(EXIT_CODES.ok);
  });

  it('names each invalid field of a broken release', async () => {
    const broken = structuredClone(RELEASE);
    const file = buttonSource(broken);
    file.path = '../outside.tsx';
    const context = setup([broken]);

    const run = await cli(['list'], context);

    expect(run.exitCode).toBe(EXIT_CODES.error);
    expect(run.stderr).toMatch(
      /items\.\d+\.variants\.react\.files\.\d+\.path: must be a relative path/
    );
  });
});
