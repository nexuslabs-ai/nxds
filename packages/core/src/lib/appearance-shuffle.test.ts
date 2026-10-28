import { describe, expect, it } from 'vitest';

import {
  BASE_TONE_OPTIONS,
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  sanitizeNxdsAppearance,
} from './appearance-model';
import { shuffleNxdsAppearance } from './appearance-shuffle';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { deriveTheme } from './derive-theme';
import { FONT_OPTIONS } from './font-options';
import { measureThemeContrast } from './theme-contrast';

/** A `random` that returns `draws` in turn, so a shuffle is repeatable. */
function sequence(...draws: number[]) {
  let index = 0;
  return () => draws[index++ % draws.length] ?? 0;
}

const STATE = {
  ...DEFAULT_NXDS_APPEARANCE,
  mode: 'dark' as const,
  lightContrast: 30,
  darkContrast: 70,
  prefs: {
    ...DEFAULT_NXDS_APPEARANCE.prefs,
    codeFont: '"JetBrains Mono Variable", monospace',
    uiFontSize: 15,
    reduceMotion: true,
  },
};

describe('shuffleNxdsAppearance', () => {
  it('returns a state the sanitizer keeps as it is', () => {
    for (const draw of [0, 0.25, 0.5, 0.75, 0.999]) {
      const shuffled = shuffleNxdsAppearance(STATE, { random: sequence(draw) });
      expect(sanitizeNxdsAppearance(shuffled)).toEqual(shuffled);
    }
  });

  it('keeps mode, contrast and the preferences it does not pick', () => {
    const shuffled = shuffleNxdsAppearance(STATE, {
      random: sequence(0.6, 0.1, 0.9),
    });

    expect(shuffled).toMatchObject({
      mode: 'dark',
      lightContrast: 30,
      darkContrast: 70,
      prefs: {
        codeFont: STATE.prefs.codeFont,
        uiFontSize: 15,
        reduceMotion: true,
      },
    });
  });

  it('picks the first and last curated options at the ends of the range', () => {
    const first = shuffleNxdsAppearance(STATE, { random: sequence(0) });
    const last = shuffleNxdsAppearance(STATE, { random: sequence(0.999) });

    expect(first).toMatchObject({
      brandColor: BRAND_COLOR_PRESETS[0]?.color,
      surfaceTone: 'stone',
      density: 'tight',
      prefs: { uiFont: FONT_OPTIONS[0].family, headingFont: null },
    });
    expect(last).toMatchObject({
      brandColor: BRAND_COLOR_PRESETS[BRAND_COLOR_PRESETS.length - 1]?.color,
      surfaceTone: 'gray',
      density: 'spacious',
      prefs: { uiFont: '"Playfair Display Variable", Georgia, serif' },
    });
  });

  it('never picks a monospace font for UI text or headings', () => {
    const mono = new Set<string>(
      FONT_OPTIONS.filter((font) => font.category === 'mono').map(
        (font) => font.family
      )
    );
    for (let draw = 0; draw < 1; draw += 0.05) {
      const { prefs } = shuffleNxdsAppearance(STATE, {
        random: sequence(draw),
      });
      expect(mono.has(prefs.uiFont)).toBe(false);
      expect(mono.has(prefs.headingFont ?? '')).toBe(false);
    }
  });

  it('picks fonts only from the fonts it is given', () => {
    const fonts = FONT_OPTIONS.filter(
      (font) => font.value === 'inter' || font.value === 'lora'
    );
    const families = new Set<string | null>([
      null,
      ...fonts.map((font) => font.family),
    ]);
    for (let draw = 0; draw < 1; draw += 0.05) {
      const { prefs } = shuffleNxdsAppearance(STATE, {
        fonts,
        random: sequence(draw),
      });
      expect(families.has(prefs.uiFont)).toBe(true);
      expect(families.has(prefs.headingFont)).toBe(true);
    }
  });
});

describe.each(BRAND_COLOR_PRESETS)('the $label brand preset', ({ color }) => {
  it.each(BASE_TONE_OPTIONS.map((tone) => tone.value))(
    'clears every contrast floor on the %s surface tone',
    (surfaceTone) => {
      const theme = deriveTheme(
        createNxdsThemeContract({
          ...DEFAULT_NXDS_APPEARANCE,
          brandColor: color,
          surfaceTone,
        })
      );
      const failures = measureThemeContrast(theme).filter(
        (check) => !check.pass
      );

      expect(failures).toEqual([]);
    }
  );
});
