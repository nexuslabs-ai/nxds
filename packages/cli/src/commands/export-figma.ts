import type { AppSetup } from '@nxds/figma/app';
import {
  captureApp,
  type CaptureOptions,
  componentNames,
} from '@nxds/figma/capture';
import { ExportError } from '@nxds/figma/errors';
import { openLink, PortInUseError } from '@nxds/figma/link';
import { LINK_PORT } from '@nxds/figma/port';
import {
  type BuildReport,
  CAPTURE_FORMAT,
  unboundValues,
} from '@nxds/figma/spec';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { importsColors } from '../colors';
import { CONFIG_FILE, readConfig } from '../config';
import { CliError, UsageError } from '../errors';

import type { CommandResult } from './result';

/** What an export writes in --out, which the next run replaces. */
const EXPORT_FILES = new Set([
  'capture.json',
  'unbound.json',
  'report.json',
  'screenshots',
]);

/** The folder in --out a capture is written to, before it replaces the last export's files. */
const STAGING = '.nxds-capture';

export type FigmaExportOptions = {
  out: string;
  /** Only these components, by Figma name, for a quicker run. */
  only?: string[];
  overwrite: boolean;
};

/** Whether an earlier export wrote `out`, which its capture.json shows. */
function exportedBefore(out: string) {
  try {
    const capture = JSON.parse(
      readFileSync(path.join(out, 'capture.json'), 'utf8')
    ) as { format?: unknown };
    return capture.format === CAPTURE_FORMAT;
  } catch {
    return false;
  }
}

/**
 * Refuses an --out holding files the export didn't write. One named like an
 * export file is refused always, since the run replaces it. Any other is
 * refused unless asked to write beside it.
 */
function assertOwnFolder(out: string, overwrite: boolean) {
  if (!existsSync(out)) return;
  const names = readdirSync(out).filter((name) => !name.startsWith('.'));
  const clash = names.find((name) => EXPORT_FILES.has(name));
  if (clash !== undefined && !exportedBefore(out)) {
    throw new UsageError(
      `${out} has a ${clash} the Figma export didn't write, and the export would replace it. Move it, or choose another --out.`
    );
  }
  if (overwrite) return;
  const other = names.find((name) => !EXPORT_FILES.has(name));
  if (other === undefined) return;
  throw new UsageError(
    `${out} has files the Figma export didn't write, such as ${other}. Pass --overwrite to write the export beside them, or choose another --out.`
  );
}

/** Refuses an --only name that isn't one of `names`, the components the recipes draw. */
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

/** `work`'s result. A failure the person can fix becomes a CliError, which prints without a stack. */
async function reported<T>(work: () => T | Promise<T>) {
  try {
    return await work();
  } catch (error) {
    throw error instanceof ExportError ? new CliError(error.message) : error;
  }
}

/**
 * Captures into a staging folder in `out`, then replaces the last export's
 * files with it. A capture that fails leaves the last export as it was.
 */
async function captureInto(
  out: string,
  app: AppSetup,
  options: Omit<CaptureOptions, 'outDir'>
) {
  const staging = path.join(out, STAGING);
  // A run stopped with Ctrl+C leaves its staging folder.
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(staging, { recursive: true });
  try {
    const result = await reported(() =>
      captureApp(app, { ...options, outDir: staging })
    );
    const json = JSON.stringify(result.capture, null, 2);
    const unbound = unboundValues(result.capture);
    writeFileSync(path.join(staging, 'capture.json'), `${json}\n`);
    writeFileSync(
      path.join(staging, 'unbound.json'),
      `${JSON.stringify(unbound, null, 2)}\n`
    );
    for (const name of EXPORT_FILES) {
      rmSync(path.join(out, name), { recursive: true, force: true });
    }
    for (const name of readdirSync(staging)) {
      renameSync(path.join(staging, name), path.join(out, name));
    }
    return { ...result, json, unbound };
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? '' : 's'}`;

function reportLines(report: BuildReport, relative: string) {
  const { written } = report;
  const lines = [
    `The plugin wrote ${plural(written.pages, 'page')}, ${plural(written.componentSets, 'component set')} and ${plural(written.components, 'component')}, with ${plural(written.instances, 'nested instance')}, ${plural(written.icons, 'icon')}, ${plural(written.variables, 'variable')}, ${plural(written.textStyles, 'text style')} and ${plural(written.effectStyles, 'shadow style')}.`,
    `It removed ${plural(report.removed.length, 'leftover')} the app no longer has.`,
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

export async function exportFigma(
  cwd: string,
  options: FigmaExportOptions,
  progress: (line: string) => void
): Promise<CommandResult> {
  const out = path.resolve(cwd, options.out);
  assertOwnFolder(out, options.overwrite);
  // Figma gets the app: its own components, CSS, provider and colours.
  const app = readConfig(cwd);
  if (!app) {
    throw new UsageError(
      `There's no ${CONFIG_FILE} here. The Figma export draws an app's own nxds components, so run it in an app nxds-cli set up, such as examples/figma-app in the nxds repo.`
    );
  }
  assertComponents(options.only, componentNames());
  const cssEntry = path.join(cwd, app.css);
  if (!existsSync(cssEntry)) {
    throw new UsageError(
      `There's no ${app.css}, the CSS entry ${CONFIG_FILE} names. Restore it, or set css in ${CONFIG_FILE} to your nxds CSS entry.`
    );
  }
  const ownColors = importsColors(readFileSync(cssEntry, 'utf8'));
  const setup: AppSetup = {
    root: cwd,
    version: app.version,
    dir: app.dir,
    css: app.css,
    iconLibrary: app.iconLibrary ?? 'phosphor',
    ownColors,
  };

  const {
    capture,
    json,
    unbound,
    problems,
    notInstalled,
    undrawn,
    missingIcons,
  } = await captureInto(out, setup, { progress, only: options.only });

  const relative = path.relative(cwd, out) || '.';
  const variants = capture.components.reduce(
    (sum, component) => sum + component.variants.length,
    0
  );
  const captured = [
    `Captured ${plural(variants, 'variant')} of ${plural(capture.components.length, 'component')} and ${plural(capture.icons.length, 'icon')} from the app's own components in ${app.dir} in ${path.join(relative, 'capture.json')}, with a screenshot of each variant in ${path.join(relative, 'screenshots')}.`,
    `${plural(unbound.length, 'value')} ${unbound.length === 1 ? "isn't" : "aren't"} bound to a variable or style. They're listed in ${path.join(relative, 'unbound.json')}.`,
    `The components use the app's CSS entry ${app.css}${ownColors ? ', with its own colours,' : ''} and its appearance provider.`,
  ];
  if (notInstalled.length > 0) {
    captured.push(
      `Components whose recipe draws a part the app didn't add aren't exported: ${notInstalled.join(', ')}.`
    );
  }
  if (undrawn.length > 0) {
    captured.push(
      `These components have no recipe in the Figma export, so Figma doesn't get them: ${undrawn.join(', ')}.`
    );
  }
  if (missingIcons.length > 0) {
    captured.push(
      `The app's icon library doesn't have these icons, so the components draw without them: ${missingIcons.join(', ')}.`
    );
  }
  if (problems.length > 0) {
    captured.push(
      ...problems.map((problem) => `Couldn't capture ${problem}`),
      'The capture is incomplete, so the plugin removes nothing from the Figma file this run.'
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
    lines: reportLines(report, relative),
    data: {
      version: app.version,
      out,
      variants,
      components: capture.components.map((component) => component.name),
      problems,
      notInstalled,
      noRecipe: undrawn,
      missingIcons,
      unbound: unbound.length,
      report,
    },
  };
}
