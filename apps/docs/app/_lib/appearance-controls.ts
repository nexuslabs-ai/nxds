import {
  DEFAULT_NXDS_APPEARANCE,
  FONT_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsAppearanceState,
  type NxdsFontCategory,
} from '@nxds/core';

export const DOCS_APPEARANCE_STORAGE_KEY = 'nxds-docs-appearance';

export const DOCS_APPEARANCE_DEFAULT_STATE = {
  ...DEFAULT_NXDS_APPEARANCE,
  mode: 'system',
} satisfies NxdsAppearanceState;

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
 * The choice a font picker shows for `family`, and the choices it offers. A
 * stack set some other way shows as Custom.
 */
export function fontPick(family: string | null, choices: FontChoice[]) {
  const chosen = choices.find((choice) => choice.family === family);
  if (chosen) return { chosen, options: choices };
  const custom = { value: 'custom', label: 'Custom', family };
  return { chosen: custom, options: [...choices, custom] };
}
