// theme.js, the module nxds-cli imports to theme an export. The build bundles
// it with this release's inputs as THEME_INPUT, which esbuild defines.
import {
  EXPORT_THEME_FLAGS,
  renderTheme,
  renderTitle,
  type ThemeFlags,
  type ThemeInput,
  type ThemeModule,
} from './theme.ts';

/** A `ThemeInput` as JSON: its maps and set as entry lists. */
export interface BakedThemeInput extends Omit<
  ThemeInput,
  'reads' | 'stylesheetReads'
> {
  readers: [string, string[]][];
  prefixes: [string, string[]][];
  stylesheetReads: string[];
}

declare const THEME_INPUT: BakedThemeInput;

const { readers, prefixes, stylesheetReads, ...rest } = THEME_INPUT;
const input: ThemeInput = {
  ...rest,
  reads: { readers: new Map(readers), prefixes: new Map(prefixes) },
  stylesheetReads: new Set(stylesheetReads),
};

export default {
  api: 1,
  flags: EXPORT_THEME_FLAGS,
  render: (theme: ThemeFlags) => renderTheme(input, theme),
  title: renderTitle,
} satisfies ThemeModule;
