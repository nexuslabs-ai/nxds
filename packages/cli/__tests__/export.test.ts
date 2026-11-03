// @vitest-environment node
import { buildSystemIndex } from '@nxds/claude-design/system-index';
import { EXPORT_THEME_FLAGS } from '@nxds/claude-design/theme';
import { compileTokensCss } from '@nxds/claude-design/tokens-css';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { c as createTar } from 'tar';
import { afterEach, describe, expect, it } from 'vitest';

import { main } from '../src/cli';
import { EXIT_CODES } from '../src/errors';

const VERSION = '0.5.0';

const TOKENS = {
  name: 'nxds',
  version: 1 as const,
  meta: {},
  color: {
    themes: [
      { id: 'light' as const, name: 'Light' },
      { id: 'dark' as const, name: 'Dark' },
    ],
    tokens: [
      {
        name: 'nx-color-background',
        value: { light: 'oklch(1 0 0)', dark: 'oklch(0.1408 0.006 285.9)' },
        usage: 'Page background. Pair with nx-color-foreground.',
      },
      {
        name: 'nx-color-foreground',
        value: {
          light: 'oklch(0.1408 0.0044 285.823)',
          dark: 'oklch(0.985 0 0)',
        },
        usage: 'Body text on nx-color-background.',
      },
    ],
  },
  type: {
    fonts: [],
    families: { sans: 'ui-sans-serif, system-ui, sans-serif' },
    groups: [
      {
        name: 'body',
        family: 'sans',
        styles: [
          {
            name: 'typography-body-default',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 400,
            usage: 'Default paragraph text.',
          },
        ],
      },
    ],
  },
  spacing: {
    tokens: [{ name: 'nx-spacing-4', value: '16px', usage: 'Spacing step 4.' }],
  },
};

const BUNDLE = [
  '/* @ds-bundle: {"format":4,"namespace":"Nxds","components":[{"name":"Button"}]} */',
  '(()=>{window.Nxds={Button:function Button(props){return window.React.createElement("button",null,props.children)}};})();',
  '',
].join('\n');

/** The `project/` files of a small system, as the package build writes them. */
const PROJECT: Record<string, string> = {
  'design-system.json': JSON.stringify(
    buildSystemIndex({ version: VERSION, at: '2026-10-26T09:00:00Z' })
  ),
  'tokens.json': JSON.stringify(TOKENS),
  'tokens.css': compileTokensCss(
    TOKENS,
    new Map([
      [
        'typography-body-default',
        [
          'font-family: var(--nx-typography-family-font-sans);',
          'font-size: 14px;',
        ],
      ],
    ])
  ),
  'README.md': 'Set the page on `nx-color-background`.\n',
  'components/bundle.js': BUNDLE,
  'components/bundle.css': '.nx\\:p-4 { padding: var(--nx-spacing-4); }\n',
  'components/index.d.ts':
    'export interface ButtonProps {\n  variant?: "default" | "outline";\n}\n',
  'components/Button/README.md':
    '# Button\n\nButton triggers an action.\n\n<x-import component-from-global-scope="Nxds.Button">Save</x-import>\n',
  'components/Button/preview.html':
    '<!-- @dsCard group="Actions" height=120 -->\n<!doctype html>\n<html><body><div id="root"></div></body></html>\n',
  'components/Cover/preview.html':
    '<!-- @dsCard height=288 -->\n<!doctype html>\n<html><body><p>nxds</p></body></html>\n',
};

/** The files a small release ships beside `project/`. */
const ROOT: Record<string, string> = {
  'coverage.md': '# Canvas prop coverage\n',
  'SETUP.md': `# Set up nxds ${VERSION} on a Claude Design canvas\n`,
  'nxds-sampler.dc.html':
    '<!doctype html>\n<html lang="en">\n<head>\n<title>nxds sampler</title>\n</head>\n</html>\n',
};

function manifestEntries(files: Record<string, string>) {
  return Object.entries(files).map(([file, content]) => ({
    path: file,
    sha256: createHash('sha256').update(content).digest('hex'),
  }));
}

/** The files of a small system in the @nxds/claude-design package layout. */
const PACKAGE_FILES: Record<string, string> = {
  'package.json': JSON.stringify({
    name: '@nxds/claude-design',
    version: VERSION,
  }),
  ...ROOT,
  'files.json': JSON.stringify({
    project: manifestEntries(PROJECT),
    root: manifestEntries(ROOT),
  }),
  ...Object.fromEntries(
    Object.entries(PROJECT).map(([file, content]) => [
      `project/${file}`,
      content,
    ])
  ),
};

const PROJECT_FILES = Object.keys(PROJECT).map((file) => `project/${file}`);

const roots: string[] = [];
const servers: Server[] = [];

afterEach(() => {
  for (const server of servers.splice(0)) server.close();
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function writeFiles(root: string, files: Record<string, string>) {
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), content);
  }
}

/** A working folder, and a built package folder to export from. */
function setup(overrides: Record<string, string> = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'nxds-cli-export-'));
  roots.push(root);
  const source = path.join(root, 'package');
  writeFiles(source, { ...PACKAGE_FILES, ...overrides });
  const cwd = path.join(root, 'work');
  mkdirSync(cwd);
  return { root, source, cwd };
}

async function cli(args: string[], cwd: string) {
  let stdout = '';
  let stderr = '';
  const exitCode = await main([...args, '--cwd', cwd], {
    out: (text) => (stdout += text),
    err: (text) => (stderr += text),
  });
  return { exitCode, stdout, stderr };
}

async function cliJson(args: string[], cwd: string) {
  const run = await cli([...args, '--json'], cwd);
  return { exitCode: run.exitCode, body: JSON.parse(run.stdout) };
}

function readOut(cwd: string, file: string) {
  return readFileSync(path.join(cwd, 'nxds-design-system', file), 'utf8');
}

function lastLine(stdout: string) {
  return stdout.trim().split('\n').at(-1);
}

/** An npm registry serving the package folder as `version`'s tarball. */
async function npmRegistry(
  root: string,
  source: string,
  {
    integrity,
    tarballUrl,
    tarballQuery = '',
  }: { integrity?: string; tarballUrl?: string; tarballQuery?: string } = {}
) {
  const staging = path.join(root, 'staging');
  cpSync(source, path.join(staging, 'package'), { recursive: true });
  const tarball = path.join(root, 'package.tgz');
  await createTar({ gzip: true, cwd: staging, file: tarball }, ['package']);
  const bytes = readFileSync(tarball);
  const digest = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;

  const server = createServer((request, response) => {
    const { port } = server.address() as AddressInfo;
    if (request.url === '/@nxds%2fclaude-design') {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify({
          'dist-tags': { latest: VERSION },
          versions: {
            [VERSION]: {
              dist: {
                tarball:
                  tarballUrl ??
                  `http://127.0.0.1:${port}/claude-design-${VERSION}.tgz${tarballQuery}`,
                integrity: integrity ?? digest,
              },
            },
          },
        })
      );
      return;
    }
    if (request.url === `/claude-design-${VERSION}.tgz`) {
      response.end(bytes);
      return;
    }
    response.statusCode = 404;
    response.end();
  });
  servers.push(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

describe('nxds-cli export claude-design', () => {
  it('writes the system folder from a built package', async () => {
    const { source, cwd } = setup();
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({
      version: VERSION,
      files: PROJECT_FILES.length,
    });
    for (const file of PROJECT_FILES) {
      expect(readOut(cwd, file)).toBe(PACKAGE_FILES[file]);
    }
    expect(
      existsSync(path.join(cwd, 'nxds-design-system', 'coverage.md'))
    ).toBe(true);
  });

  it('writes the setup guide and the sampler beside project/ and ends by pointing at the guide', async () => {
    const { source, cwd } = setup();
    const { exitCode, stdout } = await cli(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readOut(cwd, 'SETUP.md')).toBe(PACKAGE_FILES['SETUP.md']);
    expect(readOut(cwd, 'nxds-sampler.dc.html')).toBe(
      PACKAGE_FILES['nxds-sampler.dc.html']
    );
    expect(
      existsSync(path.join(cwd, 'nxds-design-system', 'project', 'SETUP.md'))
    ).toBe(false);
    expect(lastLine(stdout)).toBe(
      'Read nxds-design-system/SETUP.md and follow it. It publishes the system, installs it on a canvas and checks it.'
    );

    const json = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--out',
        'design/nxds',
        '--overwrite',
      ],
      cwd
    );
    expect(json.body.data.root).toEqual([
      path.join(cwd, 'design', 'nxds', 'coverage.md'),
      path.join(cwd, 'design', 'nxds', 'SETUP.md'),
      path.join(cwd, 'design', 'nxds', 'nxds-sampler.dc.html'),
    ]);
  });

  it('lists the files to remove before the line that points at the guide', async () => {
    const { source, cwd } = setup();
    writeFileSync(
      path.join(cwd, 'existing.json'),
      JSON.stringify(['project/components/Legacy/README.md'])
    );
    const { stdout } = await cli(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--existing',
        'existing.json',
      ],
      cwd
    );

    const lines = stdout.trim().split('\n');
    expect(lines.at(-2)).toMatch(/^Remove the 1 files .*removed\.json\.$/);
    expect(lines.at(-1)).toMatch(/^Read nxds-design-system\/SETUP\.md/);
  });

  it('refuses a release whose files.json lists no SETUP.md', async () => {
    const { source, cwd } = setup({
      'files.json': JSON.stringify({
        project: manifestEntries(PROJECT),
        root: manifestEntries({ 'coverage.md': ROOT['coverage.md'] ?? '' }),
      }),
    });

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toBe(
      "The release's files.json lists no SETUP.md, so there's no guide to follow."
    );
    expect(existsSync(path.join(cwd, 'nxds-design-system'))).toBe(false);
  });

  it.each([
    ['..', '..'],
    ['', 'an empty path'],
    ['guides/SETUP.md', 'guides/SETUP.md'],
    ['project', 'project'],
    ['removed.json', 'removed.json'],
    ['files.json', 'files.json'],
  ])('refuses %j as a root file', async (name, shown) => {
    const { source, cwd } = setup({
      'files.json': JSON.stringify({
        project: manifestEntries(PROJECT),
        root: [...manifestEntries(ROOT), { path: name, sha256: '' }],
      }),
    });

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toBe(
      `files.json lists ${shown} as a root file. A root file is one name beside project/, other than project, files.json and removed.json.`
    );
  });

  it('removes a root file the last export wrote and this release drops', async () => {
    const { source, cwd } = setup();
    await cli(['export', 'claude-design', '--source', source], cwd);
    writeFileSync(
      path.join(cwd, 'nxds-design-system', 'notes.md'),
      '# Canvas notes\n'
    );
    const kept = Object.fromEntries(
      Object.entries(ROOT).filter(([name]) => name !== 'coverage.md')
    );
    writeFiles(source, {
      'files.json': JSON.stringify({
        project: manifestEntries(PROJECT),
        root: manifestEntries(kept),
      }),
    });

    const { exitCode } = await cliJson(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readdirSync(path.join(cwd, 'nxds-design-system')).sort()).toEqual(
      [...Object.keys(kept), 'files.json', 'notes.md', 'project'].sort()
    );
    expect(JSON.parse(readOut(cwd, 'files.json'))).toMatchObject({
      root: manifestEntries(kept),
    });
  });

  it('keeps a root file this release drops when you edited it', async () => {
    const { source, cwd } = setup();
    await cli(['export', 'claude-design', '--source', source], cwd);
    const coverage = path.join(cwd, 'nxds-design-system', 'coverage.md');
    writeFileSync(coverage, '# Coverage, with my notes\n');
    writeFiles(source, {
      'files.json': JSON.stringify({
        project: manifestEntries(PROJECT),
        root: manifestEntries(
          Object.fromEntries(
            Object.entries(ROOT).filter(([name]) => name !== 'coverage.md')
          )
        ),
      }),
    });

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.attention);
    expect(readFileSync(coverage, 'utf8')).toBe('# Coverage, with my notes\n');
    expect(body.data.kept).toEqual([coverage]);
  });

  it("refuses an earlier export's files.json that lists no root files", async () => {
    const { source, cwd } = setup();
    await cli(['export', 'claude-design', '--source', source], cwd);
    const manifest = path.join(cwd, 'nxds-design-system', 'files.json');
    writeFileSync(manifest, JSON.stringify({ project: [] }));

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toBe(
      `${manifest} must hold root, a JSON array of { path, sha256 } entries. Delete it, then run the command again.`
    );
  });

  it('keeps your files beside project/ when it exports again', async () => {
    const { source, cwd } = setup();
    await cli(['export', 'claude-design', '--source', source], cwd);
    writeFileSync(
      path.join(cwd, 'nxds-design-system', 'notes.md'),
      '# Canvas notes\n'
    );

    const { exitCode } = await cliJson(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readdirSync(path.join(cwd, 'nxds-design-system')).sort()).toEqual(
      [...Object.keys(ROOT), 'files.json', 'notes.md', 'project'].sort()
    );
  });

  it("refuses a release whose SETUP.md isn't a regular file", async () => {
    const { source, cwd } = setup();
    rmSync(path.join(source, 'SETUP.md'));
    mkdirSync(path.join(source, 'SETUP.md'));

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toBe(
      "SETUP.md is missing from the release, or isn't a regular file."
    );
    expect(existsSync(path.join(cwd, 'nxds-design-system'))).toBe(false);
  });

  it("refuses a release whose sampler doesn't match files.json", async () => {
    const { source, cwd } = setup({
      'nxds-sampler.dc.html': '<!doctype html>\n<title>Edited</title>\n',
    });

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toBe(
      "nxds-sampler.dc.html doesn't match the release's files.json, so nothing was written."
    );
    expect(existsSync(path.join(cwd, 'nxds-design-system'))).toBe(false);
  });

  it('refuses a files.json that lists only project/', async () => {
    const { source, cwd } = setup({
      'files.json': JSON.stringify(manifestEntries(PROJECT)),
    });

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toMatch(
      /files\.json must hold project and root, and may hold theme, each a JSON array/
    );
  });

  it('downloads the release from the npm registry and checks its integrity', async () => {
    const { root, source, cwd } = setup();
    const registry = await npmRegistry(root, source);
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--npm-registry', registry],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data).toMatchObject({ version: VERSION });
    expect(readOut(cwd, 'project/components/bundle.js')).toBe(BUNDLE);
  });

  it('refuses a tarball that does not match its published integrity', async () => {
    const { root, source, cwd } = setup();
    const registry = await npmRegistry(root, source, {
      integrity: `sha512-${Buffer.alloc(64).toString('base64')}`,
    });
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--npm-registry', registry],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toMatch(/doesn't match its published integrity/);
    expect(existsSync(path.join(cwd, 'nxds-design-system'))).toBe(false);
  });

  it('names the releases there are when the asked-for one is missing', async () => {
    const { root, source, cwd } = setup();
    const registry = await npmRegistry(root, source);
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--npm-registry',
        registry,
        '--release',
        '9.9.9',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toMatch(/no release 9\.9\.9.*0\.5\.0/);
  });

  it.each([
    ['with a user name and password', 'https://user:secret@registry.invalid'],
    ['without an http scheme', 'user:secret@registry.invalid'],
    ['with a query', 'https://registry.invalid/?token=secret'],
    ['with an empty query', 'https://registry.invalid/?'],
    ['with an empty fragment', 'https://registry.invalid/#'],
  ])('refuses a registry URL %s', async (_, registry) => {
    const { cwd } = setup();
    const { exitCode, stdout, stderr } = await cli(
      ['export', 'claude-design', '--npm-registry', registry],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(stdout + stderr).toContain('--npm-registry');
    expect(stdout + stderr).not.toContain('secret');
  });

  it.each([
    [
      'a password',
      'https://user:secret@registry.invalid/claude-design.tgz',
      'https://registry.invalid/claude-design.tgz',
    ],
    [
      'no http scheme',
      'user:secret@registry.invalid/claude-design.tgz',
      '<invalid URL>',
    ],
    [
      'a $& in its path',
      'https://user:secret@registry.invalid/a$&b.tgz',
      'https://registry.invalid/a$&b.tgz',
    ],
  ])(
    "leaves a tarball URL's password out of its errors, with %s",
    async (_, tarballUrl, shown) => {
      const { root, source, cwd } = setup();
      const registry = await npmRegistry(root, source, { tarballUrl });
      const { exitCode, stdout, stderr } = await cli(
        ['export', 'claude-design', '--npm-registry', registry],
        cwd
      );

      expect(exitCode).toBe(EXIT_CODES.error);
      expect(stdout + stderr).toContain(`Could not reach ${shown}`);
      expect(stdout + stderr).not.toContain('secret');
    }
  );

  it("leaves a tarball URL's query out of its errors", async () => {
    const { root, source, cwd } = setup();
    const registry = await npmRegistry(root, source, {
      tarballQuery: '?token=secret',
    });
    const { exitCode, stdout, stderr } = await cli(
      ['export', 'claude-design', '--npm-registry', registry],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(stdout + stderr).toContain(
      `${registry}/claude-design-${VERSION}.tgz answered 404`
    );
    expect(stdout + stderr).not.toContain('secret');
  });

  it('keeps an existing folder unless asked to overwrite it', async () => {
    const { source, cwd } = setup();
    await cli(['export', 'claude-design', '--source', source], cwd);
    writeFileSync(
      path.join(cwd, 'nxds-design-system', 'project', 'stale.md'),
      '# Old\n'
    );

    const kept = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );
    expect(kept.exitCode).toBe(EXIT_CODES.usage);
    expect(kept.body.error).toMatch(/--overwrite/);

    const replaced = await cliJson(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );
    expect(replaced.exitCode).toBe(EXIT_CODES.ok);
    expect(
      existsSync(path.join(cwd, 'nxds-design-system', 'project', 'stale.md'))
    ).toBe(false);
    expect(readdirSync(cwd)).not.toContainEqual(
      expect.stringMatching(/^\.nxds-project-/)
    );
  });

  it('names the folder that must be writable when --out has a read-only parent', async () => {
    const { source, cwd } = setup();
    mkdirSync(path.join(cwd, 'nxds-design-system'));
    chmodSync(cwd, 0o555);
    try {
      const { exitCode, body } = await cliJson(
        ['export', 'claude-design', '--source', source],
        cwd
      );

      expect(exitCode).toBe(EXIT_CODES.usage);
      expect(body.error).toContain(`${cwd} must be writable`);
    } finally {
      chmodSync(cwd, 0o755);
    }
    expect(readdirSync(path.join(cwd, 'nxds-design-system'))).toEqual([]);
  });

  it("keeps the system's title and creation date from its current index", async () => {
    const { source, cwd } = setup();
    const current = {
      ...buildSystemIndex({ version: '0.4.6', at: '2026-10-01T08:00:00Z' }),
      title: 'Acme on nxds',
    };
    writeFileSync(path.join(cwd, 'current.json'), JSON.stringify(current));
    await cli(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--index',
        'current.json',
      ],
      cwd
    );

    expect(
      JSON.parse(readOut(cwd, 'project/design-system.json'))
    ).toMatchObject({
      title: 'Acme on nxds',
      createdOnFiles: { at: '2026-10-01T08:00:00Z' },
      lastChange: { at: '2026-10-26T09:00:00Z' },
    });
  });

  it('lists the files a republish removes, leaving the page-generated ones', async () => {
    const { source, cwd } = setup();
    writeFileSync(
      path.join(cwd, 'existing.json'),
      JSON.stringify([
        'project/README.md',
        'project/components/Legacy/README.md',
        'project/manifest.json',
        'project/api/components/button.md',
        'SKILL.md',
      ])
    );
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--existing',
        'existing.json',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.removed).toEqual(['project/components/Legacy/README.md']);
    expect(JSON.parse(readOut(cwd, 'removed.json'))).toEqual(body.data.removed);
  });

  it('removes an earlier removed.json when the export is run without --existing', async () => {
    const { source, cwd } = setup();
    writeFileSync(path.join(cwd, 'existing.json'), JSON.stringify([]));
    await cli(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--existing',
        'existing.json',
      ],
      cwd
    );

    await cli(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );

    expect(
      existsSync(path.join(cwd, 'nxds-design-system', 'removed.json'))
    ).toBe(false);
  });

  it('leaves the existing folder alone when a file does not match files.json', async () => {
    const { source, cwd } = setup();
    await cli(['export', 'claude-design', '--source', source], cwd);
    writeFileSync(
      path.join(source, 'project', 'components', 'bundle.js'),
      `${BUNDLE}window.tampered = true;\n`
    );

    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, '--overwrite'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toMatch(
      /project\/components\/bundle\.js doesn't match the release's files\.json/
    );
    expect(readOut(cwd, 'project/components/bundle.js')).toBe(BUNDLE);
  });

  it('copies only the files files.json lists', async () => {
    const { source, cwd } = setup({ 'project/notes.md': '# Draft\n' });
    const { exitCode } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(
      existsSync(path.join(cwd, 'nxds-design-system', 'project', 'notes.md'))
    ).toBe(false);
  });

  it('refuses a current index that would break the merged one', async () => {
    const { source, cwd } = setup();
    writeFileSync(
      path.join(cwd, 'current.json'),
      JSON.stringify({ title: 'Acme on nxds' })
    );
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--index',
        'current.json',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toMatch(/needs "v": 3/);
    expect(existsSync(path.join(cwd, 'nxds-design-system'))).toBe(false);
  });
});

/**
 * A small theme module in the shape theme.js has. It takes every export flag,
 * rejects a corners value nxds doesn't take with core's message, and writes
 * the theme into each file it renders, so a test can read back what it got.
 */
const THEME_JS = `const CORNERS = ['square', 'subtle', 'round'];
export default {
  api: 1,
  flags: ${JSON.stringify(EXPORT_THEME_FLAGS)},
  render(theme) {
    const corners = theme.corners;
    if (corners !== undefined && !CORNERS.includes(corners)) {
      throw new Error('--corners "' + corners + '" isn\\'t one of ' + CORNERS.join(', ') + '.');
    }
    const brand = theme['brand-color'];
    return {
      project: {
        'tokens.json': JSON.stringify({ meta: { theme } }),
        'tokens.css': '/* themed */\\n',
        'README.md': 'Themed with ' + JSON.stringify(theme) + '\\n',
      },
      index: { title: brand ? 'nxds · ' + brand : 'nxds', theme },
      guide: (files) => '# Set up nxds, ' + files + ' files, ' + JSON.stringify(theme) + '\\n',
    };
  },
};
`;

/** A release with a theme module, and files.json listing it. */
function themedSetup(themeJs = THEME_JS) {
  return setup({
    'theme.js': themeJs,
    'files.json': JSON.stringify({
      project: manifestEntries(PROJECT),
      root: manifestEntries(ROOT),
      theme: manifestEntries({ 'theme.js': themeJs }),
    }),
  });
}

const EVERY_FLAG: Record<string, string> = {
  'brand-color': '#e11d48',
  'surface-tone': 'stone',
  density: 'compact',
  corners: 'round',
  elevation: 'strong',
  stroke: 'strong',
  'light-contrast': '70',
  'dark-contrast': '30',
  font: 'inter',
  'heading-font': 'playfair-display',
  'code-font': 'jetbrains-mono',
  'font-size': '15',
  'code-font-size': '13',
};

const flagArgs = (flags: Record<string, string>) =>
  Object.entries(flags).map(([flag, value]) => `--${flag}=${value}`);

function readIndex(cwd: string) {
  return JSON.parse(readOut(cwd, 'project/design-system.json')) as Record<
    string,
    unknown
  >;
}

/** The export's design-system.json, saved as a system's current index. */
function saveIndex(cwd: string, changes: Record<string, unknown> = {}) {
  writeFileSync(
    path.join(cwd, 'current.json'),
    JSON.stringify({ ...readIndex(cwd), ...changes })
  );
}

describe('nxds-cli export claude-design with theme flags', () => {
  it('themes the system with every flag, and records the theme', async () => {
    const { source, cwd } = themedSetup();
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, ...flagArgs(EVERY_FLAG)],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.theme).toEqual(EVERY_FLAG);
    expect(JSON.parse(readOut(cwd, 'project/tokens.json'))).toEqual({
      meta: { theme: EVERY_FLAG },
    });
    expect(readOut(cwd, 'project/tokens.css')).toBe('/* themed */\n');
    expect(readIndex(cwd)).toMatchObject({
      title: 'nxds · #e11d48',
      theme: EVERY_FLAG,
      namespace: 'Nxds',
    });
    expect(readOut(cwd, 'SETUP.md')).toBe(
      `# Set up nxds, ${Object.keys(PROJECT).length} files, ${JSON.stringify(EVERY_FLAG)}\n`
    );
    expect(readOut(cwd, 'project/components/bundle.js')).toBe(BUNDLE);
    expect(existsSync(path.join(cwd, 'nxds-design-system', 'theme.js'))).toBe(
      false
    );
  });

  it('says which flags themed the system, quoted for a shell', async () => {
    const { source, cwd } = themedSetup();
    const { stdout } = await cli(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--brand-color',
        'oklch(0.6 0.2 20)',
        '--corners',
        'round',
      ],
      cwd
    );

    expect(stdout).toContain(
      'Themed with --brand-color "oklch(0.6 0.2 20)" --corners round.'
    );
  });

  it('writes the release as it is without a theme, and never loads theme.js', async () => {
    const { source, cwd } = themedSetup(
      "throw new Error('theme.js was loaded');\n"
    );
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.theme).toEqual({});
    for (const [file, content] of Object.entries(PROJECT)) {
      expect(readOut(cwd, `project/${file}`), file).toBe(content);
    }
    expect(readOut(cwd, 'SETUP.md')).toBe(ROOT['SETUP.md']);
  });

  it("refuses a value the release doesn't take, with its message", async () => {
    const { source, cwd } = themedSetup();
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, '--corners', 'bevel'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toBe(
      '--corners "bevel" isn\'t one of square, subtle, round.'
    );
    expect(existsSync(path.join(cwd, 'nxds-design-system'))).toBe(false);
  });

  it('refuses theme flags on a release from before themes', async () => {
    const { source, cwd } = setup();
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, '--corners', 'round'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toBe(
      `nxds ${VERSION} has no --corners. Pass --release latest to export a release that has it.`
    );
  });

  it("refuses to drop a system's theme on a release from before themes", async () => {
    const { source, cwd } = setup();
    writeFileSync(
      path.join(cwd, 'current.json'),
      JSON.stringify({
        ...buildSystemIndex({ version: VERSION, at: '2026-10-01T08:00:00Z' }),
        theme: { corners: 'round' },
      })
    );
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--index',
        'current.json',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toBe(
      `current.json has a theme, and nxds ${VERSION} can't theme an export. Pass --release latest to keep the theme.`
    );
  });

  it('takes an empty flag on a release from before themes, since it leaves no theme', async () => {
    const { source, cwd } = setup();
    const { exitCode } = await cliJson(
      ['export', 'claude-design', '--source', source, '--corners='],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readOut(cwd, 'project/tokens.json')).toBe(PROJECT['tokens.json']);
  });

  it('keeps the theme on an update, and changes only the flags passed', async () => {
    const { source, cwd } = themedSetup();
    const theme = { 'brand-color': '#e11d48', corners: 'round' };
    await cli(
      ['export', 'claude-design', '--source', source, ...flagArgs(theme)],
      cwd
    );
    saveIndex(cwd);

    const update = (...flags: string[]) =>
      cliJson(
        [
          'export',
          'claude-design',
          '--source',
          source,
          '--overwrite',
          '--index',
          'current.json',
          ...flags,
        ],
        cwd
      );

    const kept = await update();
    expect(kept.exitCode).toBe(EXIT_CODES.ok);
    expect(kept.body.data.theme).toEqual(theme);
    expect(JSON.parse(readOut(cwd, 'project/tokens.json')).meta.theme).toEqual(
      theme
    );

    saveIndex(cwd);
    await update('--corners', 'square');
    expect(readIndex(cwd)['theme']).toEqual({
      'brand-color': '#e11d48',
      corners: 'square',
    });

    saveIndex(cwd);
    const reset = await update('--corners=');
    expect(reset.body.data.theme).toEqual({ 'brand-color': '#e11d48' });
    expect(readIndex(cwd)['theme']).toEqual({ 'brand-color': '#e11d48' });
  });

  it('goes back to the default system when every flag is reset', async () => {
    const { source, cwd } = themedSetup();
    await cli(
      ['export', 'claude-design', '--source', source, '--corners', 'round'],
      cwd
    );
    saveIndex(cwd);
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--overwrite',
        '--index',
        'current.json',
        '--corners=',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(body.data.theme).toEqual({});
    expect(readIndex(cwd)).not.toHaveProperty('theme');
    expect(readOut(cwd, 'project/tokens.json')).toBe(PROJECT['tokens.json']);
  });

  it("keeps a system's title on an update, and retitles it when flags change the theme", async () => {
    const { source, cwd } = themedSetup();
    await cli(
      ['export', 'claude-design', '--source', source, '--brand-color=#e11d48'],
      cwd
    );
    saveIndex(cwd, { title: 'Acme on nxds' });
    const args = [
      'export',
      'claude-design',
      '--source',
      source,
      '--overwrite',
      '--index',
      'current.json',
    ];

    await cli(args, cwd);
    expect(readIndex(cwd)['title']).toBe('Acme on nxds');

    saveIndex(cwd);
    await cli([...args, '--brand-color=#4f46e5'], cwd);
    expect(readIndex(cwd)['title']).toBe('nxds · #4f46e5');
  });

  it('themes a system from before themes when flags are passed', async () => {
    const { source, cwd } = themedSetup();
    writeFileSync(
      path.join(cwd, 'current.json'),
      JSON.stringify(
        buildSystemIndex({ version: '0.4.6', at: '2026-10-01T08:00:00Z' })
      )
    );
    const { exitCode } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--index',
        'current.json',
        '--brand-color=#e11d48',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readIndex(cwd)).toMatchObject({
      title: 'nxds · #e11d48',
      theme: { 'brand-color': '#e11d48' },
      createdOnFiles: { at: '2026-10-01T08:00:00Z' },
    });
  });

  it.each([
    ['null', null],
    ['a list', ['corners', 'round']],
    ['a string', 'round'],
    ['a number value', { 'light-contrast': 70 }],
  ])('refuses a stored theme that is %s', async (_, theme) => {
    const { source, cwd } = themedSetup();
    writeFileSync(
      path.join(cwd, 'current.json'),
      JSON.stringify({
        ...buildSystemIndex({ version: VERSION, at: '2026-10-01T08:00:00Z' }),
        theme,
      })
    );
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--index',
        'current.json',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toMatch(
      /current\.json: "theme" must be an object of theme flag values/
    );
  });

  it.each([
    [
      'a flag the release has no field for',
      { shimmer: 'on' },
      `current.json theme: "shimmer" isn't a theme flag nxds ${VERSION} takes. Remove it from "theme".`,
    ],
    [
      'a mode',
      { mode: 'dark' },
      'current.json theme: a system carries Light and Dark and one icon library, so it has no "mode". Remove it from "theme".',
    ],
    [
      'an icon library',
      { icons: 'lucide' },
      'current.json theme: a system carries Light and Dark and one icon library, so it has no "icons". Remove it from "theme".',
    ],
    [
      "a value the release doesn't take",
      { corners: 'bevel' },
      'current.json theme: --corners "bevel" isn\'t one of square, subtle, round. Pass --corners <value> to change it, or --corners= to reset it.',
    ],
  ])('refuses a stored theme with %s', async (_, theme, message) => {
    const { source, cwd } = themedSetup();
    writeFileSync(
      path.join(cwd, 'current.json'),
      JSON.stringify({
        ...buildSystemIndex({ version: VERSION, at: '2026-10-01T08:00:00Z' }),
        theme,
      })
    );
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--index',
        'current.json',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.usage);
    expect(body.error).toBe(message);
  });

  it('leaves the existing export alone when theme.js fails', async () => {
    const { source, cwd } = themedSetup(
      "export default { api: 1, flags: ['corners'], render() { throw new Error('out of memory'); } };\n"
    );
    await cli(['export', 'claude-design', '--source', source], cwd);
    const { exitCode, body } = await cliJson(
      [
        'export',
        'claude-design',
        '--source',
        source,
        '--overwrite',
        '--corners',
        'round',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toBe(`nxds ${VERSION}'s theme.js failed: out of memory`);
    expect(readOut(cwd, 'project/tokens.json')).toBe(PROJECT['tokens.json']);
  });

  it("refuses a theme.js this CLI doesn't know", async () => {
    const { source, cwd } = themedSetup(
      'export default { api: 2, flags: [], render() {} };\n'
    );
    const { exitCode, body } = await cliJson(
      ['export', 'claude-design', '--source', source, '--corners', 'round'],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.error);
    expect(body.error).toMatch(/theme\.js is newer than this nxds-cli/);
  });

  it('themes a release downloaded from the npm registry', async () => {
    const { root, source, cwd } = themedSetup();
    const registry = await npmRegistry(root, source);
    const { exitCode } = await cliJson(
      [
        'export',
        'claude-design',
        '--npm-registry',
        registry,
        '--corners',
        'round',
      ],
      cwd
    );

    expect(exitCode).toBe(EXIT_CODES.ok);
    expect(readIndex(cwd)['theme']).toEqual({ corners: 'round' });
  });
});
