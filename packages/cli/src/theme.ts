import {
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
} from '@nxds/core/source/lib/appearance-model.ts';
import {
  applyNxdsThemeFlags,
  DEFAULT_NXDS_THEME,
  nxdsThemeFlags,
} from '@nxds/core/source/lib/theme-fields.ts';

import type { Font } from './catalog';
import { CLI_COMMAND } from './cli-command';
import { CliError, UsageError } from './errors';

/** A theme, as nxds.json keeps it: each `init` flag's value, by flag name. */
export type ThemeFlags = Record<string, string>;

/**
 * The theme flag nxds.json keeps as `iconLibrary` instead, since `add` and
 * `update` install that library's files.
 */
export const ICONS_FLAG = 'icons';

/** The flags that name a curated font, which `init` installs. */
const FONT_FLAGS = ['font', 'heading-font', 'code-font'];

/** The appearance nxds.json's `theme` sets, over nxds's default appearance. */
export function themeAppearance(theme: ThemeFlags = {}): NxdsAppearanceState {
  try {
    return applyNxdsThemeFlags(DEFAULT_NXDS_THEME, theme).appearance;
  } catch (error) {
    throw new CliError(
      `nxds.json theme: ${(error as Error).message} Fix it, or run \`${CLI_COMMAND} init\` with that flag.`
    );
  }
}

/**
 * `appearance` with the theme flags `flags` sets. A font flag must name a
 * font the release has, since `init` installs it.
 */
export function withThemeFlags(
  appearance: NxdsAppearanceState,
  flags: ThemeFlags,
  fonts: Font[]
): NxdsAppearanceState {
  let next: NxdsAppearanceState;
  try {
    next = applyNxdsThemeFlags(
      { ...DEFAULT_NXDS_THEME, appearance },
      flags
    ).appearance;
  } catch (error) {
    throw new UsageError((error as Error).message);
  }
  for (const flag of FONT_FLAGS) {
    const value = flags[flag];
    if (value === undefined || value === 'system' || value === 'ui') continue;
    if (!fonts.some((font) => font.name === value)) {
      throw new UsageError(
        `--${flag}: this nxds release has no font "${value}". Run \`${CLI_COMMAND} update\` first.`
      );
    }
  }
  return next;
}

/** nxds.json's `theme` for `appearance`: the flags that differ from nxds's defaults. */
export function themeFlags(appearance: NxdsAppearanceState): ThemeFlags {
  return Object.fromEntries(
    nxdsThemeFlags({ ...DEFAULT_NXDS_THEME, appearance })
      .filter(({ flag }) => flag !== ICONS_FLAG)
      .map(({ flag, value }) => [flag, value])
  );
}

/** The release fonts `appearance` uses, which the app installs and imports. */
export function themeFonts(
  appearance: NxdsAppearanceState,
  fonts: Font[]
): Font[] {
  const { uiFont, headingFont, codeFont } = appearance.prefs;
  const families = new Set([uiFont, headingFont, codeFont]);
  return fonts.filter((font) => families.has(font.family));
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

function literal(value: string | number | null) {
  if (typeof value !== 'string') return String(value);
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** `key: value` for each field of `values` that differs from `defaults`. */
function changedLines<T extends object>(
  values: T,
  defaults: T,
  indent: string
) {
  return (Object.keys(values) as (keyof T & string)[])
    .filter((key) => values[key] !== defaults[key])
    .map(
      (key) =>
        `${indent}${key}: ${literal(values[key] as string | number | null)},`
    );
}

/** `nxds-theme.ts`, which nxds owns: the appearance nxds.json's theme sets. */
export function nxdsThemeSource(appearance: NxdsAppearanceState) {
  const { prefs, ...fields } = appearance;
  const { prefs: defaultPrefs, ...defaultFields } = DEFAULT_NXDS_APPEARANCE;
  const prefLines = changedLines(prefs, defaultPrefs, '    ');
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
    ...changedLines(fields, defaultFields, '  '),
    ...(prefLines.length === 0
      ? []
      : [
          '  prefs: {',
          '    ...DEFAULT_NXDS_APPEARANCE.prefs,',
          ...prefLines,
          '  },',
        ]),
    '} satisfies NxdsAppearanceState;',
    '',
  ].join('\n');
}
