// Writes dist/: the system's files under dist/project/, files.json listing
// them with their hashes for nxds-cli, the package manifest npm publishes
// from dist/, and the canvas prop coverage report. Fails when the output
// breaks the Design System format.
import {
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
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
import { componentReads, variablesRead } from '../src/reads.ts';
import { buildStyles } from '../src/styles.ts';
import { buildSystemIndex } from '../src/system-index.ts';
import { buildTokens, typeStyleRules } from '../src/tokens.ts';
import { compileTokensCss } from '../src/tokens-css.ts';
import { validateSystem } from '../src/validate.ts';

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
const BUNDLE_BUDGET = 1.6 * 1024 * 1024;
const TYPES_BUDGET = 1024 * 1024;

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

function fileList(files: readonly string[]) {
  return files.map((file) => ({
    path: file,
    sha256: createHash('sha256')
      .update(readFileSync(path.join(projectDir, file)))
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
  const tokens = buildTokens({
    version,
    ref: gitRef(),
    reads,
    stylesheetReads: variablesRead(styles),
  });
  const tokensCss = compileTokensCss(tokens, typeStyleRules());
  write('tokens.json', `${JSON.stringify(tokens, null, 2)}\n`);
  write('tokens.css', tokensCss);
  write(
    'README.md',
    withPresetTable(readFileSync(path.join(contentDir, 'README.md'), 'utf8'))
  );
  write(
    'components/Cover/preview.html',
    readFileSync(path.join(contentDir, 'cover.html'), 'utf8')
  );

  const parts = flatComponents();
  const { code } = await buildBundle(folders, parts);
  write('components/bundle.js', code);
  write('components/bundle.css', styles);
  const indexDts = renderIndexDts(parts);
  write('components/index.d.ts', indexDts);
  assertBudget('components/bundle.js', code, BUNDLE_BUDGET);
  assertBudget('components/index.d.ts', indexDts, TYPES_BUDGET);

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

  writeFileSync(
    path.join(distDir, 'files.json'),
    `${JSON.stringify(fileList(files), null, 2)}\n`
  );
  writeFileSync(
    path.join(distDir, 'package.json'),
    `${JSON.stringify(publishedManifest(), null, 2)}\n`
  );
  copyFileSync(
    path.join(contentDir, 'package-readme.md'),
    path.join(distDir, 'README.md')
  );
  copyFileSync(
    path.join(packageRoot, '..', '..', 'LICENSE'),
    path.join(distDir, 'LICENSE')
  );

  const kb = (text: string) => Math.round(Buffer.byteLength(text) / 1024);
  console.log(
    `@nxds/claude-design ${version}: ${folders.length} components, ${parts.length} parts, bundle.js ${kb(code)} KB, index.d.ts ${kb(indexDts)} KB, ${report.props} props (${report.controls.dropdown} dropdowns, ${report.controls.toggle} toggles).`
  );
}

await main();
