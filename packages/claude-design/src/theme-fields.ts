// Which theme flags `nxds-cli export claude-design` takes, and how a theme's
// flags are written out. nxds-cli, the theme module and the docs' Claude
// Design prompt share them, so this imports nothing.

/**
 * Whether the export takes `init`'s theme flag `flag`. A system carries Light
 * and Dark, so it has no `--mode`. Icon props take the library's names, so it
 * keeps one icon library and has no `--icons`.
 */
export const isExportThemeFlag = (flag: string) =>
  flag !== 'mode' && flag !== 'icons';

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
