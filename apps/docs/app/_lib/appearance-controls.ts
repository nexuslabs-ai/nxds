import {
  DEFAULT_NXDS_APPEARANCE,
  FONT_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsAppearanceState,
  type NxdsFontCategory,
} from '@nxds/core';

export const DOCS_APPEARANCE_STORAGE_KEY = 'nxds-docs-appearance';

// Taken from the catalogue, not spelled out, so the font pickers name it; a
// catalogue without DM Sans fails the build here.
const dmSans = FONT_OPTIONS.find(({ value }) => value === 'dm-sans');
if (!dmSans) throw new Error('FONT_OPTIONS no longer offers DM Sans.');

/** The look every nxds.dev page opens with, and the one Reset returns to. */
export const DOCS_APPEARANCE_DEFAULT_STATE = {
  ...DEFAULT_NXDS_APPEARANCE,
  mode: 'system',
  corners: 'smooth',
  prefs: { ...DEFAULT_NXDS_APPEARANCE.prefs, uiFont: dmSans.family },
} satisfies NxdsAppearanceState;

/** The contrast the Playground and the homepage Customize panel both allow. */
export const CONTRAST_RANGE = { min: 0, max: 100 } as const;

export const MODE_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const satisfies readonly { value: NxdsAppearanceMode; label: string }[];

/**
 * A font a picker offers. `value` is its `nxds-cli init` flag value, and
 * `family` is the stack the prefs store, `null` for the UI font.
 */
export type FontChoice = {
  value: string;
  label: string;
  family: string | null;
};

function curatedFonts(categories: readonly NxdsFontCategory[]): FontChoice[] {
  return FONT_OPTIONS.filter((font) => categories.includes(font.category)).map(
    ({ value, label, family }) => ({ value, label, family })
  );
}

const { prefs: DEFAULT_PREFS } = DEFAULT_NXDS_APPEARANCE;

export const UI_FONTS: FontChoice[] = [
  { value: 'system', label: 'System', family: DEFAULT_PREFS.uiFont },
  ...curatedFonts(['sans', 'serif']),
];
export const HEADING_FONTS: FontChoice[] = [
  { value: 'ui', label: 'Same as UI font', family: null },
  ...curatedFonts(['sans', 'serif']),
];
export const CODE_FONTS: FontChoice[] = [
  { value: 'system', label: 'System', family: DEFAULT_PREFS.codeFont },
  ...curatedFonts(['mono']),
];

/**
 * The option of `options` a select picked, narrowed from the select's string
 * value. Every appearance editor reads its selects through this.
 */
export function findOption<T extends string>(
  options: readonly { value: T }[],
  value: string
): T | undefined {
  return options.find((option) => option.value === value)?.value;
}

/**
 * A font picker for `family`: the value it shows, the choices it offers, and
 * the family a picked value names. A stack set some other way shows as Custom.
 */
export function fontPick(family: string | null, choices: FontChoice[]) {
  const chosen = choices.find((choice) => choice.family === family);
  const custom = { value: 'custom', label: 'Custom', family };
  const options = chosen ? choices : [...choices, custom];
  return {
    value: (chosen ?? custom).value,
    options,
    familyOf: (value: string) =>
      options.find((option) => option.value === value)?.family ?? family,
  };
}
