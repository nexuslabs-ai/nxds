import { describe, expect, it } from 'vitest';

import { DEFAULT_NXDS_APPEARANCE } from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { FONT_OPTIONS } from './font-options';
import {
  applyNxdsThemeFlags,
  DEFAULT_NXDS_THEME,
  type NxdsTheme,
  nxdsThemeFlags,
} from './theme-fields';

function family(value: string) {
  const font = FONT_OPTIONS.find((option) => option.value === value);
  if (!font) throw new Error(`No curated font ${value}.`);
  return font.family;
}

/** A theme the playground could export: every theme part off its default. */
const THEME: NxdsTheme = {
  appearance: {
    ...DEFAULT_NXDS_APPEARANCE,
    mode: 'system',
    brandColor: BRAND_COLOR_PRESETS[1]?.color ?? '#4f46e5',
    surfaceTone: 'slate',
    lightContrast: 30,
    darkContrast: 80,
    density: 'compact',
    corners: 'round',
    elevation: 'soft',
    stroke: 'fine',
    prefs: {
      ...DEFAULT_NXDS_APPEARANCE.prefs,
      uiFont: family('inter'),
      headingFont: family('lora'),
      codeFont: family('jetbrains-mono'),
      uiFontSize: 15,
      codeFontSize: 13,
    },
  },
  iconLibrary: 'lucide',
};

function flagValues(theme: NxdsTheme) {
  return Object.fromEntries(
    nxdsThemeFlags(theme).map(({ flag, value }) => [flag, value])
  );
}

describe('theme flags', () => {
  it('give nothing for the default theme', () => {
    expect(nxdsThemeFlags(DEFAULT_NXDS_THEME)).toEqual([]);
  });

  it('set every theme part back to the theme they came from', () => {
    const applied = applyNxdsThemeFlags(DEFAULT_NXDS_THEME, flagValues(THEME));

    expect(applied).toEqual(THEME);
  });

  it('leave out the preferences that belong to each person', () => {
    const personal: NxdsTheme = {
      ...DEFAULT_NXDS_THEME,
      appearance: {
        ...DEFAULT_NXDS_APPEARANCE,
        prefs: {
          ...DEFAULT_NXDS_APPEARANCE.prefs,
          reduceMotion: true,
          pointerCursors: true,
          fontSmoothing: true,
        },
      },
    };

    expect(nxdsThemeFlags(personal)).toEqual([]);
  });

  it('keep a theme part whose flag is left out', () => {
    const applied = applyNxdsThemeFlags(THEME, { density: 'spacious' });

    expect(applied).toEqual({
      ...THEME,
      appearance: { ...THEME.appearance, density: 'spacious' },
    });
  });

  it('reset a font to the system stack, and headings to the UI font', () => {
    const applied = applyNxdsThemeFlags(THEME, {
      font: 'system',
      'heading-font': 'ui',
    });

    expect(applied.appearance.prefs).toMatchObject({
      uiFont: DEFAULT_NXDS_APPEARANCE.prefs.uiFont,
      headingFont: null,
    });
  });

  it.each([
    ['density', 'roomy', /--density "roomy" isn't one of .*compact/],
    ['font', 'jetbrains-mono', /--font "jetbrains-mono" isn't one of system/],
    ['code-font', 'inter', /--code-font "inter" isn't one of system/],
    [
      'brand-color',
      'not-a-color',
      /--brand-color "not-a-color" isn't a CSS color/,
    ],
    ['light-contrast', '101', /from 0 to 100/],
    ['font-size', '40', /from 8 to 32/],
    ['icons', 'feather', /--icons "feather" isn't one of phosphor/],
  ])('reject --%s %s', (flag, value, message) => {
    expect(() => applyNxdsThemeFlags(THEME, { [flag]: value })).toThrow(
      message
    );
  });
});
