import { isColor } from '@nxds/core/source/lib/perceptual-ramp.ts';

import type { Catalog, Font, ThemeField } from './catalog';
import { CLI_COMMAND } from './cli-command';
import { CliError, UsageError } from './errors';

/** A theme, as nxds.json keeps it: each `init` flag's value, by flag name. */
export type ThemeFlags = Record<string, string>;

/**
 * The theme flag nxds.json keeps as `iconLibrary` instead, since `add` and
 * `update` install that library's files.
 */
export const ICONS_FLAG = 'icons';

/** A field `nxds-theme.ts` sets: where it lives, and its value as source. */
type ThemeLine = { key: string; source: string };

/** What a theme's flags set in an app on one release. */
export type Theme = {
  /** One line per flag, in the order of the release's theme fields. */
  lines: ThemeLine[];
  /** The release fonts the theme uses, which the app installs and imports. */
  fonts: Font[];
};

type Fail = (flag: string, message: string) => Error;

function literal(value: string | null) {
  if (value === null) return 'null';
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/**
 * A font flag's line. The flag names the fallback, or one of the release's
 * fonts in the field's categories, and the line writes that font's family.
 */
function fontLine(
  release: Catalog,
  field: Extract<ThemeField, { kind: 'font' }>,
  value: string,
  fail: Fail
): ThemeLine & { font?: Font } {
  const { flag, key, fallback } = field;
  if (value === fallback.value) {
    return { key, source: literal(fallback.family) };
  }
  const fonts = release.fonts.filter((font) =>
    field.categories.includes(font.category)
  );
  const font = fonts.find((candidate) => candidate.name === value);
  if (!font) {
    const names = [fallback.value, ...fonts.map((option) => option.name)];
    throw fail(flag, `--${flag} "${value}" isn't one of ${names.join(', ')}.`);
  }
  return { key, source: literal(font.family), font };
}

/** `field`'s line for `value`, checked against what the release takes. */
function themeLine(
  release: Catalog,
  field: ThemeField,
  value: string,
  fail: Fail
): ThemeLine & { font?: Font } {
  const { flag, key } = field;
  switch (field.kind) {
    case 'color':
      if (!isColor(value)) {
        throw fail(flag, `--${flag} "${value}" isn't a CSS color.`);
      }
      return { key, source: literal(value) };
    case 'choice':
      if (!field.values.includes(value)) {
        throw fail(
          flag,
          `--${flag} "${value}" isn't one of ${field.values.join(', ')}.`
        );
      }
      return { key, source: literal(value) };
    case 'integer': {
      const number = Number(value);
      if (!/^\d+$/.test(value) || number < field.min || number > field.max) {
        throw fail(
          flag,
          `--${flag} "${value}" isn't a whole number from ${field.min} to ${field.max}.`
        );
      }
      return { key, source: String(number) };
    }
    case 'font':
      return fontLine(release, field, value, fail);
  }
}

/** Throws on a flag the release has no theme field for. */
function assertThemeFlag(release: Catalog, flag: string, passed: boolean) {
  if (release.themeFields.some((field) => field.flag === flag)) return;
  if (passed) {
    throw new UsageError(
      `nxds ${release.version} has no --${flag}. Run \`${CLI_COMMAND} update\` to move to a release that has it.`
    );
  }
  if (flag === ICONS_FLAG) {
    throw new CliError(
      `nxds.json theme: the icon library goes in "iconLibrary". Remove "${ICONS_FLAG}" from "theme".`
    );
  }
  throw new CliError(
    `nxds.json theme: "${flag}" isn't a theme flag nxds ${release.version} takes. Remove it from "theme".`
  );
}

/**
 * The theme nxds.json's `stored` flags set in an app on `release`, with the
 * `passed` init flags over them. An empty passed flag removes its stored
 * value. Each flag must be one the release takes, with a value it accepts. A
 * bad passed flag is a usage error.
 */
export function resolveTheme(
  release: Catalog,
  stored: ThemeFlags,
  passed: ThemeFlags = {}
): Theme & { flags: ThemeFlags } {
  const flags: ThemeFlags = { ...stored, ...passed };
  for (const [flag, value] of Object.entries(passed)) {
    if (value === '') delete flags[flag];
  }
  for (const flag of Object.keys(flags)) {
    assertThemeFlag(release, flag, flag in passed);
  }
  const fail: Fail = (flag, message) =>
    flag in passed
      ? new UsageError(message)
      : new CliError(
          `nxds.json theme: ${message} Fix it, or run \`${CLI_COMMAND} init --${flag} <value>\`.`
        );
  const lines = release.themeFields.flatMap((field) => {
    const value = flags[field.flag];
    if (value === undefined) return [];
    return [themeLine(release, field, value, fail)];
  });
  const used = new Set(lines.map((line) => line.font));
  return {
    flags,
    lines: lines.map(({ key, source }) => ({ key, source })),
    fonts: release.fonts.filter((font) => used.has(font)),
  };
}

/** The `@import` line that loads a release font. */
export function fontImportLine(font: Font) {
  return `@import '${font.package}';`;
}

/**
 * `css` importing exactly `wanted` of the release's `fonts`: missing imports
 * are added, and imports of the release's other fonts are removed. Imports of
 * fonts the release doesn't curate are the app's, so they stay.
 */
export function withFontImports(css: string, fonts: Font[], wanted: Font[]) {
  const unwanted = new Set(
    fonts
      .filter((font) => !wanted.includes(font))
      .map((font) => fontImportLine(font))
  );
  const kept = css.split('\n').filter((line) => !unwanted.has(line.trim()));
  const missing = wanted
    .map((font) => fontImportLine(font))
    .filter((line) => !kept.some((kept) => kept.trim() === line));
  if (missing.length === 0) return kept.join('\n');
  return `${kept.join('\n').trimEnd()}\n${missing.join('\n')}\n`;
}

/**
 * `nxds-theme.ts`, which nxds owns: the default appearance of the app's
 * release, with each field the theme sets.
 */
export function nxdsThemeSource(theme: Theme) {
  const fields = theme.lines.filter(({ key }) => !key.startsWith('prefs.'));
  const prefs = theme.lines.filter(({ key }) => key.startsWith('prefs.'));
  return [
    '// nxds-cli writes this file from the theme in nxds.json, so edits here are',
    `// lost. Change the theme with \`${CLI_COMMAND} init\` flags, such as`,
    '// `--density compact`, or override it in appearance-state.ts.',
    'import {',
    '  DEFAULT_NXDS_APPEARANCE,',
    '  type NxdsAppearanceState,',
    "} from '@nxds/core';",
    '',
    'export const nxdsTheme = {',
    '  ...DEFAULT_NXDS_APPEARANCE,',
    ...fields.map(({ key, source }) => `  ${key}: ${source},`),
    ...(prefs.length === 0
      ? []
      : [
          '  prefs: {',
          '    ...DEFAULT_NXDS_APPEARANCE.prefs,',
          ...prefs.map(
            ({ key, source }) => `    ${key.slice('prefs.'.length)}: ${source},`
          ),
          '  },',
        ]),
    '} satisfies NxdsAppearanceState;',
    '',
  ].join('\n');
}
