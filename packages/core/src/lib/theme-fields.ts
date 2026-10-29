import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  FONT_SIZE_PX_MAX,
  FONT_SIZE_PX_MIN,
  type NxdsAppearancePrefs,
  type NxdsAppearanceState,
  STROKE_OPTIONS,
} from './appearance-model';
import { FONT_OPTIONS, type NxdsFontCategory } from './font-options';
import {
  DEFAULT_ICON_LIBRARY,
  ICON_LIBRARY_OPTIONS,
  type NxdsIconLibrary,
} from './icon-libraries';
import { isColor } from './perceptual-ramp';

/**
 * An app's theme: the appearance it starts from, and the icon library its
 * components draw. The icon library is set when the app installs nxds, so it
 * isn't part of the appearance an app can change at runtime.
 */
export interface NxdsTheme {
  readonly appearance: NxdsAppearanceState;
  readonly iconLibrary: NxdsIconLibrary;
}

export const DEFAULT_NXDS_THEME: NxdsTheme = {
  appearance: DEFAULT_NXDS_APPEARANCE,
  iconLibrary: DEFAULT_ICON_LIBRARY,
};

/** Where a theme part lives in the appearance: a key of it, or of its prefs. */
export type NxdsThemeKey =
  | Exclude<keyof NxdsAppearanceState, 'prefs'>
  | `prefs.${keyof NxdsAppearancePrefs}`;

interface NxdsThemeFieldBase {
  /** The flag, without its `--`. */
  readonly flag: string;
  /** What the flag sets, for `--help`. */
  readonly description: string;
  /** The flag's value for `theme`, or undefined when no flag value says it. */
  read(theme: NxdsTheme): string | undefined;
  /** `theme` with the flag's value. Throws when the value doesn't fit. */
  write(theme: NxdsTheme, value: string): NxdsTheme;
}

/**
 * One part of a theme, as the `nxds-cli init` flag that sets it. `kind` says
 * which values the flag takes, and `key` the appearance field it sets. The
 * icon library sets none.
 */
export type NxdsThemeField = NxdsThemeFieldBase &
  (
    | { readonly kind: 'color'; readonly key: NxdsThemeKey }
    | {
        readonly kind: 'choice';
        readonly key?: NxdsThemeKey;
        readonly values: readonly string[];
      }
    | {
        readonly kind: 'integer';
        readonly key: NxdsThemeKey;
        readonly min: number;
        readonly max: number;
      }
    | {
        readonly kind: 'font';
        readonly key: NxdsThemeKey;
        /** The fallback's value, then each curated font's. */
        readonly values: readonly string[];
        /** The categories of the curated fonts the flag takes. */
        readonly categories: readonly NxdsFontCategory[];
        /**
         * The value that names no curated font, and the family it stands for:
         * the default stack, or null for the UI font.
         */
        readonly fallback: {
          readonly value: string;
          readonly family: string | null;
        };
      }
  );

function invalid(flag: string, value: string, accepted: string): Error {
  return new Error(`--${flag} "${value}" isn't ${accepted}.`);
}

function withAppearance(
  theme: NxdsTheme,
  patch: Partial<NxdsAppearanceState>
): NxdsTheme {
  return { ...theme, appearance: { ...theme.appearance, ...patch } };
}

function withPrefs(
  theme: NxdsTheme,
  patch: Partial<NxdsAppearancePrefs>
): NxdsTheme {
  return withAppearance(theme, {
    prefs: { ...theme.appearance.prefs, ...patch },
  });
}

function oneOf<V extends string>(
  flag: string,
  values: readonly V[],
  value: string
): V {
  const match = values.find((candidate) => candidate === value);
  if (match === undefined) {
    throw invalid(flag, value, `one of ${values.join(', ')}`);
  }
  return match;
}

type EnumKey =
  | 'mode'
  | 'surfaceTone'
  | 'density'
  | 'corners'
  | 'elevation'
  | 'stroke';

function enumField<K extends EnumKey>(
  flag: string,
  key: K,
  description: string,
  values: readonly NxdsAppearanceState[K][]
): NxdsThemeField {
  return {
    kind: 'choice',
    flag,
    key,
    description,
    values,
    read: (theme) => theme.appearance[key],
    write: (theme, value) =>
      withAppearance(theme, {
        [key]: oneOf(flag, values, value),
      } as Partial<NxdsAppearanceState>),
  };
}

function integer(
  flag: string,
  value: string,
  min: number,
  max: number
): number {
  const parsed = Number(value);
  if (!/^\d+$/.test(value) || parsed < min || parsed > max) {
    throw invalid(flag, value, `a whole number from ${min} to ${max}`);
  }
  return parsed;
}

function contrastField(
  flag: string,
  key: 'lightContrast' | 'darkContrast',
  description: string
): NxdsThemeField {
  return {
    kind: 'integer',
    flag,
    key,
    description,
    min: 0,
    max: 100,
    read: (theme) => String(theme.appearance[key]),
    write: (theme, value) =>
      withAppearance(theme, { [key]: integer(flag, value, 0, 100) }),
  };
}

function fontSizeField(
  flag: string,
  key: 'uiFontSize' | 'codeFontSize',
  description: string
): NxdsThemeField {
  return {
    kind: 'integer',
    flag,
    key: `prefs.${key}`,
    description,
    min: FONT_SIZE_PX_MIN,
    max: FONT_SIZE_PX_MAX,
    read: (theme) => String(theme.appearance.prefs[key]),
    write: (theme, value) =>
      withPrefs(theme, {
        [key]: integer(flag, value, FONT_SIZE_PX_MIN, FONT_SIZE_PX_MAX),
      }),
  };
}

/**
 * A font pref, by its curated font's value. `fallback` names the value the
 * pref takes when it isn't a curated font: the system stack, or for headings,
 * the UI font.
 */
function fontField(
  flag: string,
  key: 'uiFont' | 'headingFont' | 'codeFont',
  description: string,
  categories: readonly NxdsFontCategory[],
  fallback: { value: string; family: string | null }
): NxdsThemeField {
  const fonts = FONT_OPTIONS.filter((font) =>
    categories.includes(font.category)
  );
  return {
    kind: 'font',
    flag,
    key: `prefs.${key}`,
    description,
    values: [fallback.value, ...fonts.map((font) => font.value)],
    categories,
    fallback,
    read: (theme) => {
      const family = theme.appearance.prefs[key];
      if (family === fallback.family) return fallback.value;
      return fonts.find((font) => font.family === family)?.value;
    },
    write: (theme, value) => {
      const family =
        value === fallback.value
          ? fallback.family
          : fonts.find((font) => font.value === value)?.family;
      if (family === undefined) {
        throw invalid(
          flag,
          value,
          `one of ${[fallback.value, ...fonts.map((font) => font.value)].join(', ')}`
        );
      }
      return withPrefs(theme, { [key]: family });
    },
  };
}

const DEFAULT_PREFS = DEFAULT_NXDS_APPEARANCE.prefs;
const TEXT_FONTS = ['sans', 'serif'] as const;

/**
 * Every part of a theme `nxds-cli init` can set, one flag each. Reduce motion,
 * pointer cursors and font smoothing are each person's own preferences, so a
 * theme leaves them out.
 */
export const NXDS_THEME_FIELDS: readonly NxdsThemeField[] = [
  {
    kind: 'color',
    flag: 'brand-color',
    key: 'brandColor',
    description: 'brand color, as any CSS color, such as "#4f46e5"',
    read: (theme) => theme.appearance.brandColor,
    write: (theme, value) => {
      if (!isColor(value)) throw invalid('brand-color', value, 'a CSS color');
      return withAppearance(theme, { brandColor: value });
    },
  },
  enumField(
    'surface-tone',
    'surfaceTone',
    'neutral tone of backgrounds and borders',
    BASE_TONE_OPTIONS.map((option) => option.value)
  ),
  enumField(
    'density',
    'density',
    'spacing and control size',
    DENSITY_OPTIONS.map((option) => option.value)
  ),
  enumField(
    'corners',
    'corners',
    'corner radius',
    CORNER_OPTIONS.map((option) => option.value)
  ),
  enumField(
    'elevation',
    'elevation',
    'shadow depth',
    ELEVATION_OPTIONS.map((option) => option.value)
  ),
  enumField(
    'stroke',
    'stroke',
    'border width',
    STROKE_OPTIONS.map((option) => option.value)
  ),
  enumField('mode', 'mode', 'color scheme', ['light', 'dark', 'system']),
  contrastField(
    'light-contrast',
    'lightContrast',
    'light mode contrast, 0 to 100'
  ),
  contrastField(
    'dark-contrast',
    'darkContrast',
    'dark mode contrast, 0 to 100'
  ),
  fontField('font', 'uiFont', 'font for UI text', TEXT_FONTS, {
    value: 'system',
    family: DEFAULT_PREFS.uiFont,
  }),
  fontField(
    'heading-font',
    'headingFont',
    'font for headings, or "ui" for the UI font',
    TEXT_FONTS,
    { value: 'ui', family: null }
  ),
  fontField('code-font', 'codeFont', 'font for code', ['mono'], {
    value: 'system',
    family: DEFAULT_PREFS.codeFont,
  }),
  fontSizeField('font-size', 'uiFontSize', 'UI text size in px'),
  fontSizeField('code-font-size', 'codeFontSize', 'code text size in px'),
  {
    kind: 'choice',
    flag: 'icons',
    description: 'icon library nxds components draw',
    values: ICON_LIBRARY_OPTIONS.map((option) => option.value),
    read: (theme) => theme.iconLibrary,
    write: (theme, value) => ({
      ...theme,
      iconLibrary: oneOf(
        'icons',
        ICON_LIBRARY_OPTIONS.map((option) => option.value),
        value
      ),
    }),
  },
];

/**
 * The `nxds-cli init` flags that set `theme`, for each part that differs from
 * nxds's default theme. A part no flag value says, such as a font stack outside
 * the curated fonts, is left out.
 */
export function nxdsThemeFlags(
  theme: NxdsTheme
): { flag: string; value: string }[] {
  return NXDS_THEME_FIELDS.flatMap((field) => {
    const value = field.read(theme);
    if (value === undefined || value === field.read(DEFAULT_NXDS_THEME)) {
      return [];
    }
    return [{ flag: field.flag, value }];
  });
}

/**
 * `theme` with each flag `values` sets, by flag name. A flag left out keeps its
 * part of `theme`. Throws on the first value that doesn't fit.
 */
export function applyNxdsThemeFlags(
  theme: NxdsTheme,
  values: Readonly<Record<string, string | undefined>>
): NxdsTheme {
  return NXDS_THEME_FIELDS.reduce((current, field) => {
    const value = values[field.flag];
    return value === undefined ? current : field.write(current, value);
  }, theme);
}
