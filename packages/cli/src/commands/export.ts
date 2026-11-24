import {
  isPageGenerated,
  mergeSystemIndex,
  type SystemIndex,
  validateIndex,
} from '@nxds/claude-design/system-index';
import type {
  RenderedTheme,
  ThemeFlags,
  ThemeModule,
} from '@nxds/claude-design/theme';
import { formatThemeFlags } from '@nxds/claude-design/theme-fields';
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
import path from 'node:path';

import { CliError, readJson, UsageError } from '../errors';
import {
  assertThemeFlags,
  DEFAULT_NPM_REGISTRY,
  fetchDesignRelease,
  importTheme,
  isEntryList,
  isRootName,
  localPackage,
  type Manifest,
  type ManifestEntry,
  noThemeModuleError,
  readRelease,
  renderTheme,
  sha256,
  type ThemeSource,
} from '../release';

import type { CommandResult } from './result';

export type ExportOptions = {
  out: string;
  release?: string;
  source?: string;
  npmRegistry?: string;
  index?: string;
  existing?: string;
  overwrite: boolean;
  /** The theme flags passed, by name. An empty value resets the system's. */
  theme: Record<string, string>;
};

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

function readIndex(file: string) {
  const index = readJson(file);
  if (typeof index !== 'object' || index === null || Array.isArray(index)) {
    throw new UsageError(`${file} must be a system's design-system.json.`);
  }
  return index as Record<string, unknown>;
}

/** The theme a system's index records. A system from before themes has none. */
function storedTheme(index: Record<string, unknown>, file: string): ThemeFlags {
  const theme = index['theme'];
  if (theme === undefined) return {};
  if (
    typeof theme !== 'object' ||
    theme === null ||
    Array.isArray(theme) ||
    !Object.values(theme).every((value) => typeof value === 'string')
  ) {
    throw new UsageError(
      `${file}: "theme" must be an object of theme flag values, such as {"corners": "round"}. Fix it, or remove it to export the default theme.`
    );
  }
  return theme as ThemeFlags;
}

/** `stored` with each `passed` flag over it. An empty passed flag removes its stored value. */
function layeredTheme(stored: ThemeFlags, passed: ThemeFlags): ThemeFlags {
  const flags: Record<string, string> = { ...stored, ...passed };
  for (const [flag, value] of Object.entries(passed)) {
    if (value === '') delete flags[flag];
  }
  return flags;
}

/**
 * The title an export in theme `stored` gave the system, so a title that
 * still matches it is one the person never renamed. Undefined when the
 * release can't say.
 */
function storedThemeTitle(
  stored: ThemeFlags,
  module: ThemeModule | undefined,
  defaultTitle: string
) {
  if (Object.keys(stored).length === 0) return defaultTitle;
  try {
    return module?.title(stored);
  } catch {
    return undefined;
  }
}

function exportedIndex(files: Map<string, Buffer>) {
  const exported = files.get('design-system.json');
  if (!exported) throw new CliError('The release has no design-system.json.');
  return JSON.parse(exported.toString('utf8')) as SystemIndex;
}

const jsonBytes = (value: unknown) =>
  Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

/** Puts `rendered`'s files and its title and theme in place of the release's defaults. */
function applyTheme(
  rendered: RenderedTheme,
  files: Map<string, Buffer>,
  rootFiles: Map<string, Buffer>
) {
  const { project } = rendered;
  files.set('tokens.json', Buffer.from(project['tokens.json']));
  files.set('tokens.css', Buffer.from(project['tokens.css']));
  files.set('README.md', Buffer.from(project['README.md']));
  files.set(
    'design-system.json',
    jsonBytes({ ...exportedIndex(files), ...rendered.index })
  );
  rootFiles.set('SETUP.md', Buffer.from(rendered.guide(files.size)));
}

function mergeIndex(
  files: Map<string, Buffer>,
  current: Record<string, unknown>,
  currentFile: string,
  retitle: boolean
) {
  const merged = mergeSystemIndex(current, exportedIndex(files), { retitle });
  const errors = validateIndex(merged);
  if (errors.length > 0) {
    throw new UsageError(
      `${currentFile} merges into an index the page can't read, so nothing was written:\n${errors.map((error) => `  ${error}`).join('\n')}`
    );
  }
  files.set('design-system.json', jsonBytes(merged));
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
  const out = path.resolve(cwd, options.out);
  assertWritable(out, options.overwrite);

  const pkg = options.source
    ? localPackage(path.resolve(cwd, options.source))
    : await fetchDesignRelease(
        options.npmRegistry ?? DEFAULT_NPM_REGISTRY,
        options.release ?? 'latest'
      );

  try {
    const { files, rootFiles, themeModule } = readRelease(pkg.root);
    const indexFile = options.index && path.resolve(cwd, options.index);
    const current = indexFile ? readIndex(indexFile) : undefined;
    const passed = options.theme;
    const stored = current && indexFile ? storedTheme(current, indexFile) : {};
    const theme = layeredTheme(stored, passed);
    const source: ThemeSource = {
      passed,
      indexFile: options.index,
      version: pkg.version,
    };
    const defaultTitle = exportedIndex(files).title;
    const module =
      themeModule &&
      (Object.keys(theme).length > 0 || Object.keys(stored).length > 0)
        ? await importTheme(themeModule, pkg.version)
        : undefined;
    let themed: ThemeFlags = {};
    if (Object.keys(theme).length > 0) {
      if (!module) throw noThemeModuleError(theme, source);
      assertThemeFlags(theme, module.flags, source);
      const rendered = renderTheme(module, theme, source);
      applyTheme(rendered, files, rootFiles);
      themed = rendered.index.theme;
    }
    if (current && indexFile) {
      const retitle =
        current['title'] === storedThemeTitle(stored, module, defaultTitle);
      mergeIndex(files, current, indexFile, retitle);
    }
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
    if (Object.keys(themed).length > 0) {
      lines.push(
        `Themed with ${formatThemeFlags(Object.entries(themed).map(([flag, value]) => ({ flag, value })))}.`
      );
    }
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
      ok: kept.length === 0,
      lines,
      data: {
        version: pkg.version,
        theme: themed,
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
