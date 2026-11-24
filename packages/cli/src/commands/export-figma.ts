import { readIndexDts } from '@nxds/claude-design/index-dts';
import { NXDS_COLOR_APPEARANCE_KEYS } from '@nxds/core/source/lib/appearance-model.ts';
import { NXDS_THEME_FIELDS } from '@nxds/core/source/lib/theme-fields.ts';
import { type AppSetup, buildAppPage } from '@nxds/figma/app';
import { type AppProps, appProps } from '@nxds/figma/app-props';
import {
  captureComponents,
  type CaptureInput,
  componentNames,
  examples,
  releasePage,
} from '@nxds/figma/capture';
import { ExportError } from '@nxds/figma/errors';
import { openLink, PortInUseError } from '@nxds/figma/link';
import { LINK_PORT } from '@nxds/figma/port';
import { type BuildReport, unboundValues } from '@nxds/figma/spec';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importsColors } from '../colors';
import { CONFIG_FILE, readConfig } from '../config';
import { CliError, UsageError } from '../errors';
import {
  assertThemeFlags,
  DEFAULT_NPM_REGISTRY,
  fetchPackage,
  fetchRelease,
  importTheme,
  localPackage,
  readRelease,
  renderTheme,
  type ThemeSource,
} from '../release';

import type { CommandResult } from './result';

/** The React the release's bundle is built for, which it expects as page globals. */
const REACT_VERSION = '18.3.1';

/** Figma can't draw the system UI font, so an export with no --font sets text in Inter. */
const DEFAULT_FONT = 'inter';

/** What an export writes in --out, which the next run replaces. */
const EXPORT_FILES = new Set([
  'capture.json',
  'unbound.json',
  'report.json',
  'screenshots',
]);

export type FigmaExportOptions = {
  out: string;
  /** An app's own colours file, such as nxds-colors.css. */
  colors?: string;
  /** Only these components, by Figma name, for a quicker run. */
  only?: string[];
  release?: string;
  source?: string;
  npmRegistry?: string;
  overwrite: boolean;
  /** The theme flags passed, by name. */
  theme: Record<string, string>;
};

/** The theme flags that set a colour, which an app's own colours file replaces. */
const COLOR_FLAGS = NXDS_THEME_FIELDS.filter(
  (field) =>
    field.key !== undefined &&
    (NXDS_COLOR_APPEARANCE_KEYS as readonly string[]).includes(field.key)
).map((field) => field.flag);

/** Refuses an --out holding files the export didn't write, unless asked to write beside them. */
function assertOwnFolder(out: string, overwrite: boolean) {
  if (overwrite || !existsSync(out)) return;
  const other = readdirSync(out).find(
    (name) => !EXPORT_FILES.has(name) && !name.startsWith('.')
  );
  if (other === undefined) return;
  throw new UsageError(
    `${out} has files the Figma export didn't write, such as ${other}. Pass --overwrite to write the export beside them, or choose another --out.`
  );
}

/** The app's own colours file. A colour flag beside it is refused, as `init` refuses one once an app sets its own colours. */
function readColors(cwd: string, file: string, passed: Record<string, string>) {
  const colors = path.resolve(cwd, file);
  if (!existsSync(colors)) {
    throw new UsageError(
      `${file} doesn't exist. Pass the app's colours file, such as nxds-colors.css.`
    );
  }
  const flag = COLOR_FLAGS.find((name) => name in passed);
  if (flag) {
    throw new UsageError(
      `--${flag} sets a colour, and ${file} sets every colour. Change the colour in ${file}, or leave out --${flag}.`
    );
  }
  return readFileSync(colors, 'utf8');
}

/** Refuses an --only name that isn't one of `names`, the components the release draws. */
function assertComponents(
  only: readonly string[] | undefined,
  names: readonly string[]
) {
  if (only === undefined) return;
  if (only.length === 0) {
    throw new UsageError(
      '--only takes component names, such as --only Button,Badge.'
    );
  }
  const unknown = only.filter((name) => !names.includes(name));
  if (unknown.length === 0) return;
  throw new UsageError(
    `There's no component named ${unknown.join(', ')}. The components are ${names.join(', ')}.`
  );
}

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
    const pkg = await fetchPackage(
      registry,
      name,
      REACT_VERSION,
      `Leave out --npm-registry and npm_config_registry to download React from ${DEFAULT_NPM_REGISTRY}.`
    );
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

/** `work`'s result. A failure the person can fix becomes a CliError, which prints without a stack. */
async function reported<T>(work: Promise<T>) {
  try {
    return await work;
  } catch (error) {
    throw error instanceof ExportError ? new CliError(error.message) : error;
  }
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

function reportLines(report: BuildReport, relative: string) {
  const { written } = report;
  const lines = [
    `The plugin wrote ${plural(written.pages, 'page')}, ${plural(written.componentSets, 'component set')} and ${plural(written.components, 'component')}, with ${plural(written.instances, 'nested instance')}, ${plural(written.icons, 'icon')}, ${plural(written.variables, 'variable')}, ${plural(written.textStyles, 'text style')} and ${plural(written.effectStyles, 'shadow style')}.`,
    `It removed ${plural(report.removed.length, 'leftover')} the release no longer has.`,
    report.darkModeError === undefined
      ? `Colour modes: ${report.modes.join(' and ')}.`
      : `Figma refused the Dark mode: "${report.darkModeError}". The file has Light only.`,
    `${plural(report.fonts.length, 'font')} ${report.fonts.length === 1 ? 'was' : 'were'} replaced, and ${plural(report.failures.length, 'step')} failed.`,
  ];
  for (const failure of report.failures.slice(0, 5)) {
    lines.push(`  ${failure.where}: ${failure.message}`);
  }
  lines.push(`The full report is in ${path.join(relative, 'report.json')}.`);
  return lines;
}

/** Inside an app, the export draws the app's own theme and colours, so it takes neither from flags. */
function assertAppTakesNoTheme(
  options: FigmaExportOptions,
  passed: Record<string, string>
) {
  const flag = Object.keys(passed)[0];
  const given = flag
    ? `--${flag}`
    : options.colors !== undefined
      ? '--colors'
      : undefined;
  if (!given) return;
  throw new UsageError(
    `${given} doesn't apply inside an app: the export draws the app's own components, theme and colours, from ${CONFIG_FILE}'s nxds folder and CSS entry. Change them in the app, or run the export outside it.`
  );
}

export async function exportFigma(
  cwd: string,
  options: FigmaExportOptions,
  progress: (line: string) => void
): Promise<CommandResult> {
  const out = path.resolve(cwd, options.out);
  assertOwnFolder(out, options.overwrite);
  const passed = Object.fromEntries(
    Object.entries(options.theme).filter(([, value]) => value !== '')
  );
  // Inside an app, Figma gets the app: its own components, CSS and provider.
  const app = readConfig(cwd);
  if (app) assertAppTakesNoTheme(options, passed);
  const colorsCss =
    app || options.colors === undefined
      ? undefined
      : readColors(cwd, options.colors, passed);
  const registry = options.npmRegistry ?? DEFAULT_NPM_REGISTRY;
  // The release's README examples and prop types match the app's parts when it's the app's own release.
  const pkg = options.source
    ? localPackage(path.resolve(cwd, options.source))
    : await fetchRelease(registry, options.release ?? app?.version ?? 'latest');

  let files: Map<string, Buffer>;
  let themeModule: Buffer | undefined;
  try {
    ({ files, themeModule } = readRelease(pkg.root));
  } finally {
    pkg.cleanup();
  }
  if (!themeModule) {
    throw new UsageError(
      `nxds ${pkg.version} can't theme an export, and the Figma export reads its tokens through the theme. Pass --release latest.`
    );
  }
  const module = await importTheme(themeModule, pkg.version);
  // An app's theme names its tokens; the page, with the app's provider, gives their values.
  const theme = app
    ? Object.fromEntries(
        Object.entries(app.theme ?? {}).filter(([flag]) =>
          module.flags.includes(flag)
        )
      )
    : { font: DEFAULT_FONT, ...passed };
  const source: ThemeSource = { passed, version: pkg.version };
  assertThemeFlags(theme, module.flags, source);
  const rendered = renderTheme(module, theme, source);
  const file = (name: string) => {
    const bytes = files.get(name);
    if (!bytes) throw new CliError(`The release has no project/${name}.`);
    return bytes.toString('utf8');
  };
  const readmes: Record<string, string> = {};
  for (const [name, bytes] of files) {
    const card = /^components\/([^/]+)\/README\.md$/.exec(name)?.[1];
    if (card) readmes[card] = bytes.toString('utf8');
  }
  assertComponents(options.only, componentNames(readmes));
  let props = readIndexDts(file('components/index.d.ts'));

  let page: Pick<CaptureInput['files'], 'styles' | 'scripts'>;
  let missingIcons: string[] = [];
  let ownColors = false;
  let appTypes: AppProps | undefined;
  if (app) {
    ownColors = importsColors(readFileSync(path.join(cwd, app.css), 'utf8'));
    const setup: AppSetup = {
      root: cwd,
      dir: app.dir,
      css: app.css,
      iconLibrary: app.iconLibrary ?? 'phosphor',
      ownColors,
    };
    appTypes = appProps(setup, props);
    props = appTypes.props;
    const { markup, icons } = examples(readmes, props);
    const built = await reported(buildAppPage(setup, markup, icons));
    page = { styles: [built.css], scripts: [built.script] };
    missingIcons = built.missingIcons;
  } else {
    const { react, reactDom } = await reactSources(registry);
    page = releasePage({
      tokensCss: rendered.project['tokens.css'],
      bundleCss: file('components/bundle.css'),
      bundleJs: file('components/bundle.js'),
      react,
      reactDom,
      colorsCss,
    });
  }

  mkdirSync(out, { recursive: true });
  for (const name of EXPORT_FILES) {
    rmSync(path.join(out, name), { recursive: true, force: true });
  }
  const { capture, problems, notInstalled } = await reported(
    captureComponents({
      release: pkg.version,
      theme,
      files: {
        ...page,
        tokensJson: rendered.project['tokens.json'],
        readmes,
      },
      props,
      app: appTypes && { schema: appTypes.schema },
      outDir: out,
      progress,
      only: options.only,
    })
  );
  const json = JSON.stringify(capture, null, 2);
  writeFileSync(path.join(out, 'capture.json'), `${json}\n`);
  const unbound = unboundValues(capture);
  writeFileSync(
    path.join(out, 'unbound.json'),
    `${JSON.stringify(unbound, null, 2)}\n`
  );

  const relative = path.relative(cwd, out) || '.';
  const variants = capture.components.reduce(
    (sum, component) => sum + component.variants.length,
    0
  );
  const captured = [
    `Captured ${plural(variants, 'variant')} of ${plural(capture.components.length, 'component')} and ${plural(capture.icons.length, 'icon')} ${app ? `from the app's own components in ${app.dir}` : `from nxds ${pkg.version}`} in ${path.join(relative, 'capture.json')}, with a screenshot of each variant in ${path.join(relative, 'screenshots')}.`,
    `${plural(unbound.length, 'value')} ${unbound.length === 1 ? "isn't" : "aren't"} bound to a variable or style. They're listed in ${path.join(relative, 'unbound.json')}.`,
  ];
  if (app) {
    captured.push(
      `The components use the app's CSS entry ${app.css}${ownColors ? ', with its own colours,' : ''} and its appearance provider.`
    );
  }
  if (notInstalled.length > 0) {
    captured.push(
      `Components the app didn't add, or whose example uses a part it didn't add, aren't exported: ${notInstalled.join(', ')}.`
    );
  }
  if (appTypes && appTypes.newParts.length > 0) {
    captured.push(
      `The app's own parts have no example in nxds ${pkg.version}, so they aren't exported: ${appTypes.newParts.join(', ')}.`
    );
  }
  if (missingIcons.length > 0) {
    captured.push(
      `The app's icon library doesn't have these icons, so the examples draw without them: ${missingIcons.join(', ')}.`
    );
  }
  if (options.colors !== undefined) {
    captured.push(`Colours come from ${options.colors}.`);
  }
  if (!app && passed['font'] === undefined) {
    captured.push(
      `Text is set in Inter, because Figma can't draw the system UI font. Pass --font to choose another.`
    );
  }

  let link: Awaited<ReturnType<typeof openLink>>;
  try {
    link = await openLink(json, LINK_PORT);
  } catch (error) {
    if (!(error instanceof PortInUseError)) throw error;
    throw new CliError(
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
    ok: report.failures.length === 0 && problems.length === 0,
    lines: [
      ...problems.map((problem) => `Couldn't capture ${problem}`),
      ...reportLines(report, relative),
    ],
    data: {
      version: pkg.version,
      app: app !== null,
      theme,
      out,
      variants,
      components: capture.components.map((component) => component.name),
      problems,
      notInstalled,
      newParts: appTypes?.newParts ?? [],
      missingIcons,
      unbound: unbound.length,
      report,
    },
  };
}
