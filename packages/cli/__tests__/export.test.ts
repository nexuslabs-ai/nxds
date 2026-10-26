// @vitest-environment node
import { buildSystemIndex } from '@nxds/claude-design/system-index';
import { compileTokensCss } from '@nxds/claude-design/tokens-css';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
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
  'tokens.css': compileTokensCss(TOKENS),
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

/** The files of a small system in the @nxds/claude-design package layout. */
const PACKAGE_FILES: Record<string, string> = {
  'package.json': JSON.stringify({
    name: '@nxds/claude-design',
    version: VERSION,
  }),
  'coverage.md': '# Canvas prop coverage\n',
  'files.json': JSON.stringify(
    Object.entries(PROJECT).map(([file, content]) => ({
      path: file,
      sha256: createHash('sha256').update(content).digest('hex'),
    }))
  ),
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

/** An npm registry serving the package folder as `version`'s tarball. */
async function npmRegistry(
  root: string,
  source: string,
  { integrity }: { integrity?: string } = {}
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
                tarball: `http://127.0.0.1:${port}/claude-design-${VERSION}.tgz`,
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
