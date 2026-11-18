import { NXDS_COLOR_APPEARANCE_KEYS } from '@nxds/core/source/lib/appearance-model.ts';
import { NXDS_THEME_FIELDS } from '@nxds/core/source/lib/theme-fields.ts';
import { type AppSetup, buildAppPage } from '@nxds/figma/app';
import { type AppProps, appProps } from '@nxds/figma/app-props';
import {
  captureComponents,
  type CaptureInput,
  examples,
  releasePage,
} from '@nxds/figma/capture';
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

import { importsColors } from '../colors';
import { CONFIG_FILE, readConfig } from '../config';
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
  /** An app's own colours file, such as nxds-colors.css. */
  colors?: string;
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
    `The plugin built ${plural(created.componentSets, 'component set')} and ${plural(created.components, 'component')}, with ${plural(created.instances, 'nested instance')}, ${plural(created.icons, 'icon')}, ${plural(created.variables, 'variable')}, ${plural(created.textStyles, 'text style')} and ${plural(created.effectStyles, 'shadow style')}.`,
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
  const out = path.resolve(cwd, options.out ?? DEFAULT_FIGMA_DIR);
  assertWritable(out, options.overwrite);
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
    : await fetchPackage(
        registry,
        CLAUDE_DESIGN_PACKAGE,
        options.release ?? app?.version ?? 'latest'
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
  let indexDts = file('components/index.d.ts');

  let page: Pick<CaptureInput['files'], 'styles' | 'scripts'>;
  let missingIcons: string[] = [];
  let ownColors = false;
  let props: AppProps | undefined;
  if (app) {
    ownColors = importsColors(readFileSync(path.join(cwd, app.css), 'utf8'));
    const setup: AppSetup = {
      root: cwd,
      dir: app.dir,
      css: app.css,
      iconLibrary: app.iconLibrary ?? 'phosphor',
      ownColors,
    };
    try {
      props = appProps(setup, indexDts);
      indexDts = props.indexDts;
      const { markup, icons } = examples(readmes, indexDts);
      const built = await buildAppPage(setup, markup, icons);
      page = { styles: [built.css], scripts: [built.script] };
      missingIcons = built.missingIcons;
    } catch (error) {
      throw new CliError(
        `The app's nxds components didn't build: ${(error as Error).message}`
      );
    }
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
  rmSync(path.join(out, 'screenshots'), { recursive: true, force: true });
  rmSync(path.join(out, 'report.json'), { force: true });
  let result: Awaited<ReturnType<typeof captureComponents>>;
  try {
    result = await captureComponents({
      release: pkg.version,
      theme,
      files: {
        ...page,
        tokensJson: rendered.project['tokens.json'],
        indexDts,
        readmes,
      },
      app: props && { schema: props.schema },
      outDir: out,
      progress,
    });
  } catch (error) {
    throw new CliError((error as Error).message);
  }
  const { capture, problems, notInstalled } = result;
  const json = JSON.stringify(capture, null, 2);
  writeFileSync(path.join(out, 'capture.json'), `${json}\n`);

  const relative = path.relative(cwd, out) || '.';
  const variants = capture.components.reduce(
    (sum, component) => sum + component.variants.length,
    0
  );
  const captured = [
    `Captured ${plural(variants, 'variant')} of ${plural(capture.components.length, 'component')} and ${plural(capture.icons.length, 'icon')} ${app ? `from the app's own components in ${app.dir}` : `from nxds ${pkg.version}`} in ${path.join(relative, 'capture.json')}, with a screenshot of each variant in ${path.join(relative, 'screenshots')}.`,
    ...problems.map((problem) => `Couldn't capture ${problem}`),
  ];
  if (app) {
    captured.push(
      `The components use the app's CSS entry ${app.css}${ownColors ? ', with its own colours,' : ''} and its appearance provider.`
    );
  }
  if (notInstalled.length > 0) {
    captured.push(
      `The app hasn't added ${notInstalled.join(', ')}, or a part their examples use, so Figma doesn't get them.`
    );
  }
  if (props && props.newParts.length > 0) {
    captured.push(
      `${props.newParts.join(', ')} ${props.newParts.length === 1 ? "isn't" : "aren't"} in nxds ${pkg.version}, so no example draws ${props.newParts.length === 1 ? 'it' : 'them'} and Figma doesn't get ${props.newParts.length === 1 ? 'it' : 'them'}.`
    );
  }
  if (missingIcons.length > 0) {
    captured.push(
      `The app's icon library has no icon for ${missingIcons.join(', ')}, so the examples that use them draw without them.`
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
      newParts: props?.newParts ?? [],
      missingIcons,
      report,
    },
  };
}
