import type { NxdsAppearanceState } from '@nxds/core/source/lib/appearance-model.ts';
import {
  DEFAULT_NXDS_THEME,
  NXDS_THEME_FIELDS,
  type NxdsThemeField,
  type NxdsThemeKey,
} from '@nxds/core/source/lib/theme-fields.ts';

import type { Catalog, Font } from './catalog';
import { CLI_COMMAND } from './cli-command';
import { CliError } from './errors';

/** A theme, as nxds.json keeps it: each `init` flag's value, by flag name. */
export type ThemeFlags = Record<string, string>;

/**
 * The theme flag nxds.json keeps as `iconLibrary` instead, since `add` and
 * `update` install that library's files.
 */
export const ICONS_FLAG = 'icons';

/** A field `nxds-theme.ts` sets: where it lives, and its value as source. */
type ThemeLine = { key: NxdsThemeKey; source: string };

/** What a theme's flags set in an app on one release. */
export type Theme = {
  /** One line per flag, in the order of core's theme fields. */
  lines: ThemeLine[];
  /** The release fonts the theme uses, which the app installs and imports. */
  fonts: Font[];
};

/** The error for a bad flag in nxds.json's `theme`. */
export function storedThemeError(flag: string, message: string) {
  return new CliError(
    `nxds.json theme: ${message} Fix it, or run \`${CLI_COMMAND} init --${flag} <value>\`.`
  );
}

function literal(value: string | number | boolean | null) {
  if (typeof value !== 'string') return String(value);
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function valueAt(appearance: NxdsAppearanceState, key: NxdsThemeKey) {
  if (!key.startsWith('prefs.')) {
    return appearance[key as Exclude<NxdsThemeKey, `prefs.${string}`>];
  }
  return appearance.prefs[
    key.slice('prefs.'.length) as keyof NxdsAppearanceState['prefs']
  ];
}

/** Throws on a `theme` key that is no theme flag. Only nxds.json can hold one. */
function assertThemeFlags(flags: ThemeFlags) {
  for (const flag of Object.keys(flags)) {
    if (flag === ICONS_FLAG) {
      throw new CliError(
        `nxds.json theme: the icon library goes in "iconLibrary". Remove "${ICONS_FLAG}" from "theme".`
      );
    }
    if (!NXDS_THEME_FIELDS.some((field) => field.flag === flag)) {
      throw new CliError(
        `nxds.json theme: "${flag}" isn't an init theme flag. Remove it from "theme".`
      );
    }
  }
}

/**
 * `field`'s line for `value`, checked against `release`. A font flag names one
 * of the release's fonts, by name, and the line writes that font's family.
 */
function themeLine(
  release: Catalog,
  field: NxdsThemeField & { key: NxdsThemeKey },
  value: string,
  fail: (flag: string, message: string) => Error
): ThemeLine & { font?: Font } {
  const { flag, key, fallback } = field;
  const offered = release.themeFields.find(
    (candidate) => candidate.flag === flag
  );
  if (!offered) {
    throw fail(
      flag,
      `nxds ${release.version} has no --${flag}. Run \`${CLI_COMMAND} update\` to move to a release that has it.`
    );
  }
  if (offered.values && !offered.values.includes(value)) {
    throw fail(
      flag,
      `--${flag} "${value}" isn't one of ${offered.values.join(', ')}.`
    );
  }
  if (fallback?.value === value) {
    // The fallback is the UI font, or the default stack of the app's release.
    const source =
      fallback.family === null ? 'null' : `DEFAULT_NXDS_APPEARANCE.${key}`;
    return { key, source };
  }
  if (fallback) {
    const font = release.fonts.find((candidate) => candidate.name === value);
    if (!font) {
      throw fail(flag, `nxds ${release.version} has no font "${value}".`);
    }
    return { key, source: literal(font.family), font };
  }
  try {
    const { appearance } = field.write(DEFAULT_NXDS_THEME, value);
    return { key, source: literal(valueAt(appearance, key)) };
  } catch (error) {
    throw fail(flag, (error as Error).message);
  }
}

/**
 * What `flags` set in an app on `release`. Each flag must be one the release
 * takes, with a value it accepts. `fail` makes the error for a bad value.
 */
export function resolveTheme(
  release: Catalog,
  flags: ThemeFlags,
  fail: (flag: string, message: string) => Error
): Theme {
  assertThemeFlags(flags);
  const lines = NXDS_THEME_FIELDS.flatMap((field) => {
    const value = flags[field.flag];
    if (value === undefined || field.key === undefined) return [];
    return [themeLine(release, { ...field, key: field.key }, value, fail)];
  });
  const used = new Set(lines.map((line) => line.font));
  return {
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
