// The release as a user gets it: dist/ packed the way npm publishes it, served
// from a local npm registry as `latest`, and exported by the built nxds-cli
// with the command the setup page gives. The checks load what it writes.
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const packageRoot = path.join(import.meta.dirname, '..', '..');
const cli = path.join(packageRoot, '..', 'cli', 'dist', 'index.js');
const EXPORT_DIR = 'nxds-design-system';

async function pack(folder: string) {
  const { stdout } = await run(
    'pnpm',
    ['pack', '--pack-destination', folder, '--json'],
    { cwd: packageRoot }
  );
  const { version, filename } = JSON.parse(stdout) as {
    version: string;
    filename: string;
  };
  return { version, bytes: readFileSync(filename) };
}

/** An npm registry serving `bytes` as @nxds/claude-design's `latest`. */
async function registry(version: string, bytes: Buffer) {
  const integrity = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  const server = createServer((request, response) => {
    const { port } = server.address() as AddressInfo;
    if (request.url === '/@nxds%2fclaude-design') {
      response.setHeader('content-type', 'application/json');
      response.end(
        JSON.stringify({
          'dist-tags': { latest: version },
          versions: {
            [version]: {
              dist: {
                tarball: `http://127.0.0.1:${port}/package.tgz`,
                integrity,
              },
            },
          },
        })
      );
      return;
    }
    if (request.url === '/package.tgz') {
      response.end(bytes);
      return;
    }
    response.statusCode = 404;
    response.end();
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return { url: `http://127.0.0.1:${port}`, server };
}

async function exportRelease() {
  if (!existsSync(cli)) {
    throw new Error(
      `${cli} is missing. Run pnpm --filter nxds-cli build first.`
    );
  }
  const cwd = mkdtempSync(path.join(tmpdir(), 'nxds-claude-design-smoke-'));
  const { version, bytes } = await pack(cwd);
  const { url, server } = await registry(version, bytes);
  try {
    const { stdout } = await run('node', [cli, 'export', 'claude-design'], {
      cwd,
      env: { ...process.env, npm_config_registry: url },
    }).catch((error: { stderr?: string }) => {
      throw new Error(`nxds-cli export claude-design failed: ${error.stderr}`);
    });
    const next = `Read ${path.join(EXPORT_DIR, 'SETUP.md')} and follow it.`;
    if (!stdout.includes(next)) {
      throw new Error(`The export doesn't end with "${next}":\n${stdout}`);
    }
  } finally {
    server.close();
  }
  return path.join(cwd, EXPORT_DIR);
}

/** The folder `nxds-cli export claude-design` wrote: `project/`, SETUP.md and the rest. */
export const exportDir = await exportRelease();
