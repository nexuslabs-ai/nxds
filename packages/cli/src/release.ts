// An nxds release: @nxds/claude-design from the npm registry or a built
// folder, the files its files.json lists, and its theme module. Both exports
// read it.
import type {
  RenderedTheme,
  ThemeFlags,
  ThemeModule,
} from '@nxds/claude-design/theme';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { x as extract } from 'tar';
import { EnvHttpProxyAgent, fetch } from 'undici';

import { CliError, readJson, UsageError } from './errors';
import { assertRegistryUrl, httpUrl } from './url';

const CLAUDE_DESIGN_PACKAGE = '@nxds/claude-design';
export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

const FETCH_TIMEOUT_MS = 60_000;
const dispatcher = new EnvHttpProxyAgent();

export type ManifestEntry = { path: string; sha256: string };

/** The module that themes an export, beside `project/`. */
const THEME_FILE = 'theme.js';

/** `files.json`: each file the release ships, as the package build wrote it. `project` paths are under `project/`, and `root` files sit beside it. `theme` is theme.js, beside them too. Releases from before themes have none. */
export type Manifest = {
  project: ManifestEntry[];
  root: ManifestEntry[];
  theme?: ManifestEntry;
};

type Packument = {
  'dist-tags'?: Record<string, string>;
  versions?: Record<
    string,
    { dist?: { tarball?: string; integrity?: string } }
  >;
};

/** `url` without its credentials or query, to print in an error. */
function redactUrl(url: string) {
  const redacted = httpUrl(url);
  if (!redacted) return '<invalid URL>';
  redacted.username = '';
  redacted.password = '';
  redacted.search = '';
  return redacted.href;
}

async function download(url: string) {
  const shown = redactUrl(url);
  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await fetch(url, {
      dispatcher,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    const { message, cause } = error as Error;
    // undici quotes the URL it was given in some of its messages. A function
    // replacement keeps a `$&` in the URL from inserting the match.
    const reason = (
      cause instanceof Error ? cause.message : message
    ).replaceAll(url, () => shown);
    throw new CliError(
      `Could not reach ${shown} (${reason}). Check your connection, or set HTTPS_PROXY if you are behind a proxy, then run the command again.`
    );
  }
  if (!response.ok) {
    throw new CliError(
      `${shown} answered ${response.status}. Run the command again later.`
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

function packageUrl(registry: string, name: string) {
  return `${registry.replace(/\/+$/, '')}/${name.replace('/', '%2f')}`;
}

/** The tarball and its integrity for `name` at `release`, a version or a dist-tag. A bad registry URL's error ends with `registryHint`. */
async function resolveTarball(
  registry: string,
  name: string,
  release: string,
  registryHint: string
) {
  assertRegistryUrl(
    '--npm-registry (or npm_config_registry)',
    registry,
    registryHint
  );
  const url = packageUrl(registry, name);
  const body = (await download(url)).toString('utf8');
  let packument: Packument;
  try {
    packument = JSON.parse(body) as Packument;
  } catch {
    throw new CliError(
      `${redactUrl(url)} didn't answer with JSON. Check --npm-registry, or your proxy, then run the command again.`
    );
  }
  const version = packument['dist-tags']?.[release] ?? release;
  const dist = packument.versions?.[version]?.dist;
  if (!dist?.tarball || !dist.integrity) {
    const known = Object.keys(packument.versions ?? {})
      .slice(-5)
      .join(', ');
    throw new UsageError(
      `${name} has no release ${release}. Recent releases: ${known || 'none'}.`
    );
  }
  return { version, tarball: dist.tarball, integrity: dist.integrity };
}

// npm's `sha512-<base64>` Subresource Integrity string.
function checkIntegrity(bytes: Buffer, integrity: string, tarball: string) {
  const expected = integrity
    .split(/\s+/)
    .find((entry) => entry.startsWith('sha512-'));
  if (!expected) {
    throw new CliError(
      `${redactUrl(tarball)} has no sha512 integrity to check it against.`
    );
  }
  const actual = `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
  if (actual !== expected) {
    throw new CliError(
      `${redactUrl(tarball)} doesn't match its published integrity. Run the command again; if it keeps failing, report it.`
    );
  }
}

/** `name`'s files at `release`, in a temporary folder, checked against their published integrity. A bad registry URL's error ends with `registryHint`, which says what to do instead. */
export async function fetchPackage(
  registry: string,
  name: string,
  release: string,
  registryHint: string
) {
  const { version, tarball, integrity } = await resolveTarball(
    registry,
    name,
    release,
    registryHint
  );
  const bytes = await download(tarball);
  checkIntegrity(bytes, integrity, tarball);
  const folder = mkdtempSync(path.join(tmpdir(), 'nxds-package-'));
  const cleanup = () => rmSync(folder, { recursive: true, force: true });
  try {
    const file = path.join(folder, 'package.tgz');
    writeFileSync(file, bytes);
    const unpacked = path.join(folder, 'package');
    mkdirSync(unpacked);
    await extract({
      file,
      cwd: unpacked,
      strip: 1,
      filter: (_, entry) =>
        'type' in entry &&
        (entry.type === 'File' || entry.type === 'Directory'),
    });
    return { version, root: unpacked, cleanup };
  } catch (error) {
    cleanup();
    throw error;
  }
}

/** The release at `release`, a version or a dist-tag, from the npm registry. */
export function fetchRelease(registry: string, release: string) {
  return fetchPackage(
    registry,
    CLAUDE_DESIGN_PACKAGE,
    release,
    `For a private registry, unpack the tarball from \`npm pack ${CLAUDE_DESIGN_PACKAGE}\` and pass its package folder with --source.`
  );
}

/** A built @nxds/claude-design dist folder, as `fetchRelease` returns a downloaded one. */
export function localPackage(source: string) {
  if (!existsSync(path.join(source, 'project'))) {
    throw new UsageError(
      `${source} has no project/ folder. Point --source at a built @nxds/claude-design dist folder.`
    );
  }
  const manifest = existsSync(path.join(source, 'package.json'))
    ? (readJson(path.join(source, 'package.json')) as { version?: string })
    : {};
  return {
    version: manifest.version ?? 'local',
    root: source,
    cleanup: () => {},
  };
}

// The names the export writes beside project/ itself.
const EXPORT_NAMES = new Set(['project', 'files.json', 'removed.json']);

// A root file is one name beside project/ that the export doesn't write
// itself.
export const isRootName = (name: string) =>
  name !== '' &&
  name !== '.' &&
  name !== '..' &&
  path.basename(name) === name &&
  !EXPORT_NAMES.has(name);

export const sha256 = (bytes: Buffer) =>
  createHash('sha256').update(bytes).digest('hex');

const isEntry = (value: unknown): value is ManifestEntry =>
  typeof (value as ManifestEntry | undefined)?.path === 'string' &&
  typeof (value as ManifestEntry).sha256 === 'string';

export const isEntryList = (value: unknown): value is ManifestEntry[] =>
  Array.isArray(value) && value.every(isEntry);

function readManifest(root: string): Manifest {
  const file = path.join(root, 'files.json');
  if (!existsSync(file)) {
    throw new CliError(
      `${root} has no files.json. Export from an @nxds/claude-design release or a built dist folder.`
    );
  }
  const value = readJson(file) as Partial<Manifest> | null;
  if (
    !isEntryList(value?.project) ||
    !isEntryList(value.root) ||
    !(
      value.theme === undefined ||
      (isEntry(value.theme) && value.theme.path === THEME_FILE)
    )
  ) {
    throw new CliError(
      `${file} must hold project and root, each a JSON array of { path, sha256 } entries, and may hold theme, the { path, sha256 } entry for ${THEME_FILE}.`
    );
  }
  return { project: value.project, root: value.root, theme: value.theme };
}

// The bytes of each entry under `dir`, checked against its hash. An error
// names the entry by `prefix` and its path.
function readEntries(dir: string, entries: ManifestEntry[], prefix: string) {
  const files = new Map<string, Buffer>();
  for (const entry of entries) {
    const file = path.join(dir, entry.path);
    if (!existsSync(file) || !lstatSync(file).isFile()) {
      throw new CliError(
        `${prefix}${entry.path} is missing from the release, or isn't a regular file.`
      );
    }
    const bytes = readFileSync(file);
    if (sha256(bytes) !== entry.sha256) {
      throw new CliError(
        `${prefix}${entry.path} doesn't match the release's files.json, so nothing was written.`
      );
    }
    files.set(entry.path, bytes);
  }
  return files;
}

// The package build validated exactly the files files.json lists, at its
// hashes, so those are the only files read: `project/` and the files beside it.
export function readRelease(root: string) {
  const manifest = readManifest(root);
  const projectDir = path.join(root, 'project');
  for (const { path: file } of manifest.project) {
    const relative = path.relative(projectDir, path.join(projectDir, file));
    if (relative.split(path.sep)[0] === '..' || path.isAbsolute(relative)) {
      throw new CliError(`files.json lists ${file}, outside project/.`);
    }
  }
  for (const { path: file } of manifest.root) {
    if (!isRootName(file)) {
      throw new CliError(
        `files.json lists ${file || 'an empty path'} as a root file. A root file is one name beside project/, other than project, files.json and removed.json.`
      );
    }
  }
  if (!manifest.root.some((entry) => entry.path === 'SETUP.md')) {
    throw new CliError(
      "The release's files.json lists no SETUP.md, so there's no guide to follow."
    );
  }
  return {
    files: readEntries(projectDir, manifest.project, 'project/'),
    rootFiles: readEntries(root, manifest.root, ''),
    themeModule: manifest.theme
      ? readEntries(root, [manifest.theme], '').get(THEME_FILE)
      : undefined,
  };
}

export type ThemeSource = {
  passed: ThemeFlags;
  indexFile?: string;
  version: string;
};

const noFlagError = (flag: string, version: string) =>
  new UsageError(
    `nxds ${version} has no --${flag}. Pass --release latest to export a release that has it.`
  );

/** The error for a theme on a release from before themes, which has no theme module. */
export function noThemeModuleError(
  theme: ThemeFlags,
  { passed, indexFile, version }: ThemeSource
) {
  const flag = Object.keys(theme).find((name) => name in passed);
  if (flag !== undefined) return noFlagError(flag, version);
  return new UsageError(
    `${indexFile} has a theme, and nxds ${version} can't theme an export. Pass --release latest to keep the theme.`
  );
}

/** Throws on a flag the release doesn't take, naming where it came from. */
export function assertThemeFlags(
  flags: ThemeFlags,
  taken: readonly string[],
  { passed, indexFile, version }: ThemeSource
) {
  for (const flag of Object.keys(flags)) {
    if (taken.includes(flag)) continue;
    if (flag in passed) throw noFlagError(flag, version);
    if (flag === 'mode' || flag === 'icons') {
      throw new UsageError(
        `${indexFile} theme: a system carries Light and Dark and one icon library, so it has no "${flag}". Remove it from "theme".`
      );
    }
    throw new UsageError(
      `${indexFile} theme: "${flag}" isn't a theme flag nxds ${version} takes. Remove it from "theme".`
    );
  }
}

const isThemeModule = (value: unknown): value is ThemeModule =>
  typeof value === 'object' &&
  value !== null &&
  (value as ThemeModule).api === 1 &&
  Array.isArray((value as ThemeModule).flags) &&
  typeof (value as ThemeModule).render === 'function' &&
  typeof (value as ThemeModule).title === 'function';

/** The release's theme module, imported from the bytes files.json's hash checked. */
export async function importTheme(bytes: Buffer, version: string) {
  let imported: { default?: unknown };
  try {
    imported = (await import(
      `data:text/javascript;base64,${bytes.toString('base64')}`
    )) as { default?: unknown };
  } catch (error) {
    throw new CliError(
      `nxds ${version}'s theme.js failed to load (${(error as Error).message}). Report it at https://github.com/nexuslabs-ai/nxds/issues.`
    );
  }
  if (!isThemeModule(imported.default)) {
    throw new CliError(
      `nxds ${version}'s theme.js is newer than this nxds-cli. Run \`npx nxds-cli@latest\` to get the newest one.`
    );
  }
  return imported.default;
}

const isRendered = (value: unknown): value is RenderedTheme => {
  const rendered = value as RenderedTheme | undefined;
  return (
    typeof rendered?.guide === 'function' &&
    typeof rendered.index?.title === 'string' &&
    typeof rendered.index.theme === 'object' &&
    ['tokens.json', 'tokens.css', 'README.md'].every(
      (file) =>
        typeof rendered.project?.[file as keyof RenderedTheme['project']] ===
        'string'
    )
  );
};

/** `error`, thrown by theme.js, as the error to report. A flag it rejects names where the flag came from. */
function themeError(
  error: unknown,
  { passed, indexFile, version }: ThemeSource
) {
  const { message, flag } = error as Error & { flag?: unknown };
  if (typeof flag === 'string' && flag in passed) {
    return new UsageError(message);
  }
  if (typeof flag === 'string' && indexFile !== undefined) {
    return new UsageError(
      `${indexFile} theme: ${message} Pass --${flag} <value> to change it, or --${flag}= to reset it.`
    );
  }
  return new CliError(`nxds ${version}'s theme.js failed: ${message}`);
}

/** What `theme` renders for `flags`. */
export function renderTheme(
  theme: ThemeModule,
  flags: ThemeFlags,
  source: ThemeSource
) {
  const { version } = source;
  let rendered: unknown;
  try {
    rendered = theme.render(flags);
  } catch (error) {
    throw themeError(error, source);
  }
  if (!isRendered(rendered)) {
    throw new CliError(
      `nxds ${version}'s theme.js rendered no token files, README or setup guide.`
    );
  }
  return rendered;
}
