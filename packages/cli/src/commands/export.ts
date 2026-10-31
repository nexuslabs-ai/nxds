import {
  isPageGenerated,
  mergeSystemIndex,
  type SystemIndex,
  validateIndex,
} from '@nxds/claude-design/system-index';
import { createHash } from 'node:crypto';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { x as extract } from 'tar';
import { EnvHttpProxyAgent, fetch } from 'undici';

import { CliError, readJson, UsageError } from '../errors';
import { assertRegistryUrl, httpUrl } from '../url';

import type { CommandResult } from './result';

export const CLAUDE_DESIGN_PACKAGE = '@nxds/claude-design';
export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';
export const DEFAULT_EXPORT_DIR = 'nxds-design-system';

const FETCH_TIMEOUT_MS = 60_000;
const dispatcher = new EnvHttpProxyAgent();

export type ExportOptions = {
  out?: string;
  release?: string;
  source?: string;
  npmRegistry?: string;
  index?: string;
  existing?: string;
  overwrite: boolean;
};

type ManifestEntry = { path: string; sha256: string };

/** `files.json`: each file the release ships, as the package build wrote it. `project` paths are under `project/`, and `root` files sit beside it. */
type Manifest = { project: ManifestEntry[]; root: ManifestEntry[] };

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

function packageUrl(registry: string) {
  return `${registry.replace(/\/+$/, '')}/${CLAUDE_DESIGN_PACKAGE.replace('/', '%2f')}`;
}

/** The tarball and its integrity for `release`, a version or a dist-tag. */
async function resolveTarball(registry: string, release: string) {
  assertRegistryUrl(
    '--npm-registry (or npm_config_registry)',
    registry,
    `For a private registry, unpack the tarball from \`npm pack ${CLAUDE_DESIGN_PACKAGE}\` and pass its package folder with --source.`
  );
  const url = packageUrl(registry);
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
      `${CLAUDE_DESIGN_PACKAGE} has no release ${release}. Recent releases: ${known || 'none'}.`
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

/** The package's files in a temporary folder: `project/`, `coverage.md` and the rest. */
async function fetchPackage(registry: string, release: string) {
  const { version, tarball, integrity } = await resolveTarball(
    registry,
    release
  );
  const bytes = await download(tarball);
  checkIntegrity(bytes, integrity, tarball);
  const folder = mkdtempSync(path.join(tmpdir(), 'nxds-claude-design-'));
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

function localPackage(source: string) {
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

function assertWritable(out: string, overwrite: boolean) {
  if (!existsSync(out) || readdirSync(out).length === 0 || overwrite) return;
  throw new UsageError(
    `${out} already has files. Pass --overwrite to replace the export in it, or choose another --out.`
  );
}

function readPaths(file: string): string[] {
  const value = readJson(file);
  if (
    !Array.isArray(value) ||
    !value.every((entry) => typeof entry === 'string')
  ) {
    throw new UsageError(
      `${file} must be a JSON array of the system's file paths.`
    );
  }
  return value;
}

// Paths the system has and the export doesn't. A publish keeps every file it
// isn't sent, so these go as `null` to remove them. Files the page generates
// stay.
function stalePaths(existing: string[], exported: Set<string>) {
  return existing
    .filter((file) => file.startsWith('project/'))
    .filter((file) => !isPageGenerated(file.slice('project/'.length)))
    .filter((file) => !exported.has(file))
    .sort();
}

// The names the export writes beside project/ itself.
const EXPORT_NAMES = new Set(['project', 'files.json', 'removed.json']);

// A root file is one name beside project/ that the export doesn't write
// itself.
const isRootName = (name: string) =>
  name !== '' &&
  name !== '.' &&
  name !== '..' &&
  path.basename(name) === name &&
  !EXPORT_NAMES.has(name);

const sha256 = (bytes: Buffer) =>
  createHash('sha256').update(bytes).digest('hex');

const isEntryList = (value: unknown): value is ManifestEntry[] =>
  Array.isArray(value) &&
  value.every(
    (entry) =>
      typeof entry?.path === 'string' && typeof entry.sha256 === 'string'
  );

function readManifest(root: string): Manifest {
  const file = path.join(root, 'files.json');
  if (!existsSync(file)) {
    throw new CliError(
      `${root} has no files.json. Export from an @nxds/claude-design release or a built dist folder.`
    );
  }
  const value = readJson(file) as Partial<Manifest> | null;
  if (!isEntryList(value?.project) || !isEntryList(value.root)) {
    throw new CliError(
      `${file} must hold project and root, each a JSON array of { path, sha256 } entries.`
    );
  }
  return { project: value.project, root: value.root };
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
function readRelease(root: string) {
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
  };
}

// The root files the last export into `out` listed in its files.json and
// this release doesn't ship.
function droppedRootFiles(out: string, rootFiles: Map<string, Buffer>) {
  const file = path.join(out, 'files.json');
  if (!existsSync(file)) return [];
  const value = readJson(file) as Partial<Manifest> | null;
  if (!isEntryList(value?.root)) {
    throw new UsageError(
      `${file} must hold root, a JSON array of { path, sha256 } entries. Delete it, then run the command again.`
    );
  }
  return value.root.filter(
    (entry) => isRootName(entry.path) && !rootFiles.has(entry.path)
  );
}

// Removes each dropped root file the last export wrote, and returns the names
// of the ones that were edited since, which stay.
function removeDroppedRootFiles(out: string, dropped: ManifestEntry[]) {
  const edited: string[] = [];
  for (const entry of dropped) {
    const file = path.join(out, entry.path);
    if (!existsSync(file)) continue;
    const unchanged =
      lstatSync(file).isFile() && sha256(readFileSync(file)) === entry.sha256;
    if (unchanged) rmSync(file);
    else edited.push(entry.path);
  }
  return edited;
}

function writeRootFiles(out: string, rootFiles: Map<string, Buffer>) {
  for (const [name, bytes] of rootFiles) {
    writeFileSync(path.join(out, name), bytes);
  }
}

const entriesOf = (files: Map<string, Buffer>) =>
  [...files].map(([file, bytes]) => ({ path: file, sha256: sha256(bytes) }));

// Lists what the export wrote in files.json, so the next export can remove a
// root file its release drops.
function writeManifest(
  out: string,
  files: Map<string, Buffer>,
  rootFiles: Map<string, Buffer>
) {
  const manifest: Manifest = {
    project: entriesOf(files),
    root: entriesOf(rootFiles),
  };
  writeFileSync(
    path.join(out, 'files.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function mergeIndex(files: Map<string, Buffer>, currentFile: string) {
  const exported = files.get('design-system.json');
  if (!exported) throw new CliError('The release has no design-system.json.');
  const merged = mergeSystemIndex(
    readJson(currentFile) as Record<string, unknown>,
    JSON.parse(exported.toString('utf8')) as SystemIndex
  );
  const errors = validateIndex(merged);
  if (errors.length > 0) {
    throw new UsageError(
      `${currentFile} merges into an index the page can't read, so nothing was written:\n${errors.map((error) => `  ${error}`).join('\n')}`
    );
  }
  files.set(
    'design-system.json',
    Buffer.from(`${JSON.stringify(merged, null, 2)}\n`)
  );
}

// Stages beside `out`, so the staging folder is never inside the published
// root. When a write or rename throws, it tries to put the old project/ back.
function writeProject(out: string, files: Map<string, Buffer>) {
  mkdirSync(out, { recursive: true });
  const staging = makeStaging(path.dirname(out), out);
  const next = path.join(staging, 'next');
  const previous = path.join(staging, 'previous');
  const projectDir = path.join(out, 'project');
  try {
    for (const [file, bytes] of files) {
      mkdirSync(path.dirname(path.join(next, file)), { recursive: true });
      writeFileSync(path.join(next, file), bytes);
    }
    if (existsSync(projectDir)) renameSync(projectDir, previous);
    renameSync(next, projectDir);
  } catch (error) {
    // A failed restore throws before rmSync, so the staging folder, which
    // then holds the only copy of the old project/, stays.
    restore(previous, projectDir, error);
    rmSync(staging, { recursive: true, force: true });
    throw renameError(error, out);
  }
  rmSync(staging, { recursive: true, force: true });
}

function makeStaging(parent: string, out: string) {
  try {
    return mkdtempSync(path.join(parent, '.nxds-project-'));
  } catch (error) {
    const { code, message } = error as NodeJS.ErrnoException;
    if (code !== 'EACCES' && code !== 'EPERM' && code !== 'EROFS') throw error;
    throw new UsageError(
      `The export stages project/ in ${parent}, beside ${out}, so ${parent} must be writable (${message}).`
    );
  }
}

function restore(previous: string, projectDir: string, cause: unknown) {
  if (!existsSync(previous)) return;
  try {
    renameSync(previous, projectDir);
  } catch (error) {
    throw new CliError(
      `The export failed (${(cause as Error).message}) and couldn't put the old project/ back (${(error as Error).message}). It is in ${previous}.`
    );
  }
}

function renameError(error: unknown, out: string) {
  if ((error as NodeJS.ErrnoException).code !== 'EXDEV') return error;
  return new UsageError(
    `${out} is on another filesystem from its parent folder, so project/ can't be moved into it. Pass an --out folder inside ${out}.`
  );
}

export async function exportClaudeDesign(
  cwd: string,
  options: ExportOptions
): Promise<CommandResult> {
  const out = path.resolve(cwd, options.out ?? DEFAULT_EXPORT_DIR);
  assertWritable(out, options.overwrite);

  const pkg = options.source
    ? localPackage(path.resolve(cwd, options.source))
    : await fetchPackage(
        options.npmRegistry ?? DEFAULT_NPM_REGISTRY,
        options.release ?? 'latest'
      );

  try {
    const { files, rootFiles } = readRelease(pkg.root);
    if (options.index) mergeIndex(files, path.resolve(cwd, options.index));
    const exported = new Set(
      [...files.keys()].map((file) => `project/${file}`)
    );
    const removed = options.existing
      ? stalePaths(readPaths(path.resolve(cwd, options.existing)), exported)
      : [];
    const dropped = droppedRootFiles(out, rootFiles);
    writeProject(out, files);
    const kept = removeDroppedRootFiles(out, dropped);
    writeRootFiles(out, rootFiles);
    writeManifest(out, files, rootFiles);
    const removedFile = path.join(out, 'removed.json');
    if (options.existing) {
      writeFileSync(removedFile, `${JSON.stringify(removed, null, 2)}\n`);
    } else {
      rmSync(removedFile, { force: true });
    }

    const relative = path.relative(cwd, out) || '.';
    const lines = [
      `Exported nxds ${pkg.version} as a Claude Design System: ${files.size} files in ${path.join(relative, 'project')}.`,
    ];
    if (rootFiles.has('coverage.md')) {
      lines.push(
        `The props the canvas can't set are in ${path.join(relative, 'coverage.md')}.`
      );
    }
    for (const name of kept) {
      lines.push(
        `Kept ${path.join(relative, name)}: this release doesn't ship it, and you edited it.`
      );
    }
    if (removed.length > 0) {
      lines.push(
        `Remove the ${removed.length} files the system has and this release doesn't: they're listed in ${path.join(relative, 'removed.json')}.`
      );
    }
    lines.push(
      `Read ${path.join(relative, 'SETUP.md')} and follow it. It publishes the system, installs it on a canvas and checks it.`
    );
    return {
      ok: true,
      lines,
      data: {
        version: pkg.version,
        out,
        files: files.size,
        removed,
        kept: kept.map((name) => path.join(out, name)),
        root: [...rootFiles.keys()].map((name) => path.join(out, name)),
      },
    };
  } finally {
    pkg.cleanup();
  }
}
