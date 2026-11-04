// Writes dist/: the system's files under dist/project/, the files beside it
// (the canvas prop coverage report, SETUP.md and the sampler artboard),
// theme.js, which nxds-cli runs to theme an export, the package manifest npm
// publishes from dist/, and files.json, which lists those files with their
// hashes for nxds-cli. The default token files, README and SETUP.md come from
// theme.js, as a themed export's do. Fails when the output, or a theme at the
// edge of what a flag takes, breaks the Design System format.
import { NXDS_THEME_FIELDS } from '@nxds/core';
import {
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildBundle } from '../src/bundle.ts';
import { canvasPartFiles } from '../src/canvas/pages.ts';
import { CANVAS_PARTS, EXCLUDED_SLUGS, GROUPS } from '../src/groups.ts';
import { withPresetTable } from '../src/presets.ts';
import {
  buildPreview,
  type ComponentFolder,
  componentReadme,
  folderCanvasExample,
} from '../src/previews.ts';
import {
  coverage,
  flatComponents,
  renderCoverage,
  renderIndexDts,
} from '../src/props.ts';
import { componentReads } from '../src/reads.ts';
import { guideTemplate, SAMPLER_FILE, samplerProblems } from '../src/setup.ts';
import { buildStyles } from '../src/styles.ts';
import { buildSystemIndex } from '../src/system-index.ts';
import {
  EXPORT_THEME_FLAGS,
  type ThemeFlags,
  type ThemeModule,
} from '../src/theme.ts';
import { buildThemeModule } from '../src/theme-bundle.ts';
import { variablesRead } from '../src/token-reads.ts';
import type { TokensFile } from '../src/tokens.ts';
import { tokensProblems, validateSystem } from '../src/validate.ts';

import { FULL_THEME } from './full-theme.ts';

const packageRoot = path.join(import.meta.dirname, '..');
const contentDir = path.join(packageRoot, 'content');
const distDir = path.join(packageRoot, 'dist');
const projectDir = path.join(distDir, 'project');

const manifest = JSON.parse(
  readFileSync(path.join(packageRoot, 'package.json'), 'utf8')
);
const version: string = manifest.version;

function gitRef() {
  return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8',
  }).trim();
}

// nxds's own budgets, well under the Design System format's caps (src/validate.ts).
const BUNDLE_BUDGET = 2.7 * 1024 * 1024;
const TYPES_BUDGET = 1024 * 1024;
const THEME_BUDGET = 2 * 1024 * 1024;

function assertBudget(file: string, contents: string, budget: number) {
  const bytes = Buffer.byteLength(contents);
  if (bytes <= budget) return;
  throw new Error(
    `${file}: ${Math.round(bytes / 1024)} KB, over its ${Math.round(budget / 1024)} KB budget.`
  );
}

function write(relative: string, contents: string) {
  const file = path.join(projectDir, relative);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

// Every exported component folder, in card order. A folder missing from
// GROUPS, or a GROUPS name nothing exports, stops the build.
function componentFolders(): ComponentFolder[] {
  const exported = new Map(
    [...exportedComponentSlugs()]
      .filter((slug) => !EXCLUDED_SLUGS.has(slug))
      .map((slug) => [componentLabel(slug), slug])
  );
  const grouped = GROUPS.flatMap(([group, names]) =>
    names.map((name) => ({ name, group }))
  );
  const problems = [
    ...[...exported.keys()]
      .filter((name) => !grouped.some((entry) => entry.name === name))
      .map((name) => `${name} has no group in src/groups.ts.`),
    ...grouped
      .filter((entry) => !exported.has(entry.name))
      .map(
        (entry) =>
          `src/groups.ts lists ${entry.name}, which @nxds/react doesn't export.`
      ),
  ];
  if (problems.length > 0) throw new Error(problems.join('\n'));
  return grouped.map(({ name, group }) => ({
    name,
    group,
    slug: exported.get(name) as string,
  }));
}

function publishedManifest() {
  const { name, description, keywords, homepage, bugs, repository, license } =
    manifest;
  return {
    name,
    version,
    description,
    keywords,
    homepage,
    bugs,
    repository,
    license,
    type: 'module',
  };
}

/**
 * One theme per value at the edge of each export flag: both ends of a
 * number, every option and font, and two colour forms.
 */
function edgeThemes(): ThemeFlags[] {
  return NXDS_THEME_FIELDS.filter((field) =>
    EXPORT_THEME_FLAGS.includes(field.flag)
  ).flatMap((field) => {
    switch (field.kind) {
      case 'color':
        return ['#4f46e5', 'oklch(0.7 0.25 20)'].map((value) => ({
          [field.flag]: value,
        }));
      case 'integer':
        return [field.min, field.max].map((value) => ({
          [field.flag]: String(value),
        }));
      case 'choice':
      case 'font':
        return field.values.map((value) => ({ [field.flag]: value }));
    }
  });
}

/** Problems a theme's token files have, one line per theme and problem. */
function themeProblems(theme: ThemeModule, flags: ThemeFlags) {
  const { project } = theme.render(flags);
  return tokensProblems(
    JSON.parse(project['tokens.json']) as TokensFile,
    project['tokens.css']
  ).map((problem) => `${JSON.stringify(flags)}: ${problem}`);
}

/** Problems the full theme has as a whole system, in a copy of project/. */
function fullThemeProblems(theme: ThemeModule) {
  const copy = mkdtempSync(path.join(tmpdir(), 'nxds-theme-'));
  try {
    cpSync(projectDir, copy, { recursive: true });
    const { project, index, guide } = theme.render(FULL_THEME);
    guide(1);
    for (const [file, contents] of Object.entries(project)) {
      writeFileSync(path.join(copy, file), contents);
    }
    const indexFile = path.join(copy, 'design-system.json');
    writeFileSync(
      indexFile,
      JSON.stringify({
        ...JSON.parse(readFileSync(indexFile, 'utf8')),
        ...index,
      })
    );
    return validateSystem(copy).errors.map(
      (error) => `the full theme: ${error}`
    );
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
}

/** The module nxds-cli imports to theme an export. It isn't copied out. */
const THEME_FILE = 'theme.js';

/** The files `nxds-cli` copies beside project/. */
const ROOT_FILES = ['coverage.md', 'SETUP.md', SAMPLER_FILE];

function fileList(dir: string, files: readonly string[]) {
  return files.map((file) => ({
    path: file,
    sha256: createHash('sha256')
      .update(readFileSync(path.join(dir, file)))
      .digest('hex'),
  }));
}

async function main() {
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(projectDir, { recursive: true });
  const at = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

  const folders = componentFolders();
  const reads = await componentReads(folders);
  const styles = await buildStyles();
  const readme = withPresetTable(
    readFileSync(path.join(contentDir, 'README.md'), 'utf8')
  );
  const sampler = readFileSync(path.join(contentDir, SAMPLER_FILE), 'utf8');
  const { module: theme, bytes: themeBytes } = await buildThemeModule(
    {
      version,
      ref: gitRef(),
      reads,
      stylesheetReads: variablesRead(styles),
      readme,
      guide: guideTemplate({
        template: readFileSync(path.join(contentDir, 'SETUP.md'), 'utf8'),
        readme,
        sampler,
        version,
      }),
    },
    path.join(distDir, THEME_FILE)
  );
  if (themeBytes > THEME_BUDGET) {
    throw new Error(
      `${THEME_FILE}: ${Math.round(themeBytes / 1024)} KB, over its ${Math.round(THEME_BUDGET / 1024)} KB budget.`
    );
  }
  const defaults = theme.render({});
  for (const [file, contents] of Object.entries(defaults.project)) {
    write(file, contents);
  }
  write(
    'components/Cover/preview.html',
    readFileSync(path.join(contentDir, 'cover.html'), 'utf8')
  );

  const parts = flatComponents();
  const samplerErrors = samplerProblems(sampler, {
    readme: defaults.project['README.md'],
    stylesheets: defaults.project['tokens.css'] + styles,
    parts,
  });
  if (samplerErrors.length > 0) throw new Error(samplerErrors.join('\n'));
  const { code } = await buildBundle(folders, parts);
  const indexDts = renderIndexDts(parts);
  assertBudget('components/bundle.js', code, BUNDLE_BUDGET);
  assertBudget('components/index.d.ts', indexDts, TYPES_BUDGET);
  write('components/bundle.js', code);
  write('components/bundle.css', styles);
  write('components/index.d.ts', indexDts);

  const report = coverage(parts);
  if (report.missing.length > 0) {
    throw new Error(
      `index.d.ts: no canvas rule covers these props. Give each a JSON or not-needed entry in src/props.ts:\n${report.missing.map(({ name, type }) => `  ${name}: ${type}`).join('\n')}`
    );
  }
  writeFileSync(path.join(distDir, 'coverage.md'), renderCoverage(report));

  const exported = new Set(parts.map((part) => part.name));
  for (const folder of folders) {
    const html = await buildPreview(folder);
    const example = await folderCanvasExample(folder.slug, exported);
    const own = parts.filter((part) => part.slug === folder.slug);
    write(`components/${folder.name}/preview.html`, html);
    write(
      `components/${folder.name}/README.md`,
      componentReadme({ folder, parts: own, example })
    );
  }

  const canvasGroups = new Map(
    CANVAS_PARTS.map((part) => [part.name, part.group])
  );
  for (const [file, contents] of Object.entries(
    canvasPartFiles(parts, canvasGroups)
  )) {
    write(`components/${file}`, contents);
  }

  write(
    'design-system.json',
    `${JSON.stringify(buildSystemIndex({ version, at }), null, 2)}\n`
  );

  const { errors, files } = validateSystem(projectDir);
  if (errors.length > 0) {
    throw new Error(
      `The export breaks the Design System format:\n${errors.map((error) => `  ${error}`).join('\n')}`
    );
  }
  const themeErrors = [
    ...edgeThemes().flatMap((flags) => themeProblems(theme, flags)),
    ...fullThemeProblems(theme),
  ];
  if (themeErrors.length > 0) {
    throw new Error(
      `A themed export breaks the Design System format:\n${themeErrors.map((error) => `  ${error}`).join('\n')}`
    );
  }

  writeFileSync(
    path.join(distDir, 'package.json'),
    `${JSON.stringify(publishedManifest(), null, 2)}\n`
  );
  writeFileSync(path.join(distDir, 'SETUP.md'), defaults.guide(files.length));
  copyFileSync(
    path.join(contentDir, SAMPLER_FILE),
    path.join(distDir, SAMPLER_FILE)
  );
  copyFileSync(
    path.join(contentDir, 'package-readme.md'),
    path.join(distDir, 'README.md')
  );
  copyFileSync(
    path.join(packageRoot, '..', '..', 'LICENSE'),
    path.join(distDir, 'LICENSE')
  );
  const released = {
    project: fileList(projectDir, files),
    root: fileList(distDir, ROOT_FILES),
    theme: fileList(distDir, [THEME_FILE])[0],
  };
  writeFileSync(
    path.join(distDir, 'files.json'),
    `${JSON.stringify(released, null, 2)}\n`
  );

  const kb = (text: string) => Math.round(Buffer.byteLength(text) / 1024);
  console.log(
    `@nxds/claude-design ${version}: ${folders.length} components, ${parts.length} parts, bundle.js ${kb(code)} KB, index.d.ts ${kb(indexDts)} KB, theme.js ${Math.round(themeBytes / 1024)} KB, ${report.props} props (${report.controls.dropdown} dropdowns, ${report.controls.toggle} toggles).`
  );
}

await main();
