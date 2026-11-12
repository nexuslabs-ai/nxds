import { captureComponents } from '@nxds/figma/capture';
import { openLink, PortInUseError } from '@nxds/figma/link';
import { LINK_PORT } from '@nxds/figma/port';
import type { BuildReport } from '@nxds/figma/spec';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CliError, UsageError } from '../errors';

import {
  assertThemeFlags,
  assertWritable,
  CLAUDE_DESIGN_PACKAGE,
  DEFAULT_NPM_REGISTRY,
  fetchPackage,
  importTheme,
  localPackage,
  readRelease,
  renderTheme,
  type ThemeSource,
} from './export';
import type { CommandResult } from './result';

export const DEFAULT_FIGMA_DIR = 'nxds-figma';

/** The React the release's bundle is built for, which it expects as page globals. */
const REACT_VERSION = '18.3.1';

/** Figma can't draw the system UI font, so an export with no --font sets text in Inter. */
const DEFAULT_FONT = 'inter';

export type FigmaExportOptions = {
  out?: string;
  release?: string;
  source?: string;
  npmRegistry?: string;
  overwrite: boolean;
  /** The theme flags passed, by name. */
  theme: Record<string, string>;
};

/** The plugin's manifest, when this CLI runs from the nxds repo. */
function pluginManifest() {
  const file = fileURLToPath(
    new URL('../../figma/plugin/manifest.json', import.meta.url)
  );
  return existsSync(file)
    ? file
    : 'packages/figma/plugin/manifest.json in the nxds repo';
}

/** React and ReactDOM's UMD builds, from the npm registry. */
async function reactSources(registry: string) {
  const read = async (name: string, file: string) => {
    const pkg = await fetchPackage(registry, name, REACT_VERSION);
    try {
      return readFileSync(path.join(pkg.root, 'umd', file), 'utf8');
    } finally {
      pkg.cleanup();
    }
  };
  return {
    react: await read('react', 'react.production.min.js'),
    reactDom: await read('react-dom', 'react-dom.production.min.js'),
  };
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

function reportLines(report: BuildReport, relative: string) {
  const { created } = report;
  const lines = [
    `The plugin built ${plural(created.componentSets, 'component set')} and ${plural(created.components, 'component')}, with ${plural(created.instances, 'nested instance')}, ${plural(created.variables, 'variable')}, ${plural(created.textStyles, 'text style')} and ${plural(created.effectStyles, 'shadow style')}.`,
    report.darkModeError === undefined
      ? `Colour modes: ${report.modes.join(' and ')}.`
      : `Figma refused the Dark mode: "${report.darkModeError}". The file has Light only.`,
    `${plural(report.unbound.length, 'value')} ${report.unbound.length === 1 ? "isn't" : "aren't"} bound to a variable or style, ${plural(report.fonts.length, 'font')} ${report.fonts.length === 1 ? 'was' : 'were'} replaced, and ${plural(report.failures.length, 'step')} failed.`,
  ];
  for (const failure of report.failures.slice(0, 5)) {
    lines.push(`  ${failure.where}: ${failure.message}`);
  }
  lines.push(`The full report is in ${path.join(relative, 'report.json')}.`);
  return lines;
}

export async function exportFigma(
  cwd: string,
  options: FigmaExportOptions,
  progress: (line: string) => void
): Promise<CommandResult> {
  const out = path.resolve(cwd, options.out ?? DEFAULT_FIGMA_DIR);
  assertWritable(out, options.overwrite);
  const registry = options.npmRegistry ?? DEFAULT_NPM_REGISTRY;
  const pkg = options.source
    ? localPackage(path.resolve(cwd, options.source))
    : await fetchPackage(
        registry,
        CLAUDE_DESIGN_PACKAGE,
        options.release ?? 'latest'
      );

  let files: Map<string, Buffer>;
  let themeModule: Buffer | undefined;
  try {
    ({ files, themeModule } = readRelease(pkg.root));
  } finally {
    pkg.cleanup();
  }
  if (!themeModule) {
    throw new UsageError(
      `nxds ${pkg.version} can't theme an export, and the Figma export sets its font through the theme. Pass --release latest.`
    );
  }
  const passed = Object.fromEntries(
    Object.entries(options.theme).filter(([, value]) => value !== '')
  );
  const theme = { ...passed };
  if (theme['font'] === undefined) theme['font'] = DEFAULT_FONT;
  const source: ThemeSource = { passed, version: pkg.version };
  const module = await importTheme(themeModule, pkg.version);
  assertThemeFlags(theme, module.flags, source);
  const rendered = renderTheme(module, theme, source);
  const file = (name: string) => {
    const bytes = files.get(name);
    if (!bytes) throw new CliError(`The release has no project/${name}.`);
    return bytes.toString('utf8');
  };
  const { react, reactDom } = await reactSources(registry);

  mkdirSync(out, { recursive: true });
  rmSync(path.join(out, 'screenshots'), { recursive: true, force: true });
  rmSync(path.join(out, 'report.json'), { force: true });
  let capture: Awaited<ReturnType<typeof captureComponents>>;
  try {
    capture = await captureComponents({
      release: pkg.version,
      theme,
      files: {
        bundleJs: file('components/bundle.js'),
        bundleCss: file('components/bundle.css'),
        tokensCss: rendered.project['tokens.css'],
        tokensJson: rendered.project['tokens.json'],
        indexDts: file('components/index.d.ts'),
      },
      react,
      reactDom,
      outDir: out,
      progress,
    });
  } catch (error) {
    throw new CliError((error as Error).message);
  }
  const json = JSON.stringify(capture, null, 2);
  writeFileSync(path.join(out, 'capture.json'), `${json}\n`);

  const relative = path.relative(cwd, out) || '.';
  const variants = capture.components.reduce(
    (sum, component) => sum + component.variants.length,
    0
  );
  const captured = [
    `Captured ${plural(variants, 'variant')} of ${plural(capture.components.length, 'component')} from nxds ${pkg.version} in ${path.join(relative, 'capture.json')}, with a screenshot of each in ${path.join(relative, 'screenshots')}.`,
  ];
  if (passed['font'] === undefined) {
    captured.push(
      `Text is set in Inter, because Figma can't draw the system UI font. Pass --font to choose another.`
    );
  }

  let link: Awaited<ReturnType<typeof openLink>>;
  try {
    link = await openLink(json, LINK_PORT);
  } catch (error) {
    if (!(error instanceof PortInUseError)) throw error;
    throw new UsageError(
      `${error.message} Stop whatever uses it, then run the command again. The plugin only connects to port ${LINK_PORT}.`
    );
  }
  progress(
    [
      ...captured,
      '',
      'Next, in the Figma desktop app:',
      '  1. Open a new design file.',
      `  2. Plugins > Development > Import plugin from manifest…, then choose ${pluginManifest()}. You only do this once.`,
      '  3. Plugins > Development > nxds export.',
      '',
      `Waiting for the plugin on http://localhost:${LINK_PORT}. Press Ctrl+C to stop.`,
    ].join('\n')
  );
  const report = await link.report;
  await link.close();
  writeFileSync(
    path.join(out, 'report.json'),
    `${JSON.stringify(report, null, 2)}\n`
  );

  return {
    ok: report.failures.length === 0,
    lines: reportLines(report, relative),
    data: {
      version: pkg.version,
      theme,
      out,
      variants,
      components: capture.components.map((component) => component.name),
      report,
    },
  };
}
