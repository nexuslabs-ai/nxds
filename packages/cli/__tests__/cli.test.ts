// @vitest-environment node
import { type Catalog, catalogSchema, type Font } from '@nxds/catalog';
import { writeRegistry } from '@nxds/catalog/scripts/registry.mjs';
import { FONT_OPTIONS } from '@nxds/core/source/lib/font-options.ts';
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

/** A fresh Next.js App Router app, and a registry with `releases`. */
function setup(releases: Catalog[] = [RELEASE]) {
  const root = mkdtempSync(path.join(tmpdir(), 'nxds-cli-test-'));
  roots.push(root);
  const app = path.join(root, 'app');
  const registry = path.join(root, 'registry');
  mkdirSync(path.join(app, 'app'), { recursive: true });
  writeFileSync(
    path.join(app, 'package.json'),
    JSON.stringify({
      name: 'acme',
      dependencies: { next: '^16.0.0', react: '^19.2.0' },
      devDependencies: {
        tailwindcss: '^4.1.0',
        '@tailwindcss/postcss': '^4.1.0',
      },
    })
  );
  writeFileSync(
    path.join(app, 'tsconfig.json'),
    JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } })
  );
  writeFileSync(path.join(app, 'app/layout.tsx'), NEXT_LAYOUT);
  writeFileSync(path.join(app, 'app/globals.css'), "@import 'tailwindcss';\n");
  writeRegistry(registry, releases);
  return { app, registry };
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
  return { name, family: font.family, package: font.package, range: '^5.3.0' };
}
const INTER = releaseFont('inter');
const LORA = releaseFont('lora');
const JETBRAINS_MONO = releaseFont('jetbrains-mono');
const NXDS_THEME = 'app/nxds-theme.ts';

/**
 * The committed release as `version`, with icon libraries and fonts to pick
 * from: Tabler, the icons its items carry, first, then Lucide.
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

  it.each([
    ['--density', 'roomy', /--density "roomy" isn't one of .*compact/],
    ['--font', 'jetbrains-mono', /--font "jetbrains-mono" isn't one of system/],
    ['--code-font', 'inter', /--code-font "inter" isn't one of system/],
    ['--font', 'geist', /--font: this nxds release has no font "geist"/],
  ])('exits 2 for %s %s', async (flag, value, message) => {
    const context = setup([choicesRelease('0.4.7')]);

    const run = await cli(['init', flag, value], context);

    expect(run.exitCode).toBe(EXIT_CODES.usage);
    expect(run.stderr).toMatch(message);
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
