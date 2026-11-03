// The theme flags `nxds-cli export claude-design` takes, and how a theme's
// flags are written out. nxds-cli, the theme module and the docs' Claude
// Design prompt share them.
import { NXDS_THEME_FIELDS, type NxdsTheme, nxdsThemeFlags } from '@nxds/core';

/**
 * Every `init` theme flag but two. A system carries Light and Dark, so it has
 * no `--mode`. Icon props take the library's names, so it keeps one icon
 * library and has no `--icons`.
 */
export const EXPORT_THEME_FLAGS: readonly string[] = NXDS_THEME_FIELDS.map(
  (field) => field.flag
).filter((flag) => flag !== 'mode' && flag !== 'icons');

export type ThemeFlag = { flag: string; value: string };

/** A flag value as a shell reads it: quoted unless it's a plain word. */
function shellValue(value: string) {
  return /^[\w.-]+$/.test(value) ? value : `"${value}"`;
}

/** `flags` as command-line flags, such as `--brand-color "#e11d48" --corners round`. */
export function formatThemeFlags(flags: readonly ThemeFlag[]) {
  return flags
    .map(({ flag, value }) => `--${flag} ${shellValue(value)}`)
    .join(' ');
}

/** The export flags that set `theme`, for each part that differs from nxds's default. */
export function exportThemeFlags(theme: NxdsTheme): ThemeFlag[] {
  return nxdsThemeFlags(theme).filter(({ flag }) =>
    EXPORT_THEME_FLAGS.includes(flag)
  );
}

/** `flags`, by name, in the order `init` lists its theme flags. */
export function orderedThemeFlags(
  flags: Readonly<Record<string, string>>
): ThemeFlag[] {
  return NXDS_THEME_FIELDS.flatMap(({ flag }) => {
    const value = flags[flag];
    return value === undefined ? [] : [{ flag, value }];
  });
}
