import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import typographyTokens from '../../tokens/primitives/typography/typography-default.json';

import {
  appearancePrefsToCss,
  BASE_TONE_OPTIONS,
  BASE_TONE_SEEDS,
  CORNER_OPTIONS,
  createNxdsThemeContract,
  DEFAULT_BRAND_COLOR,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  normalizeAppearanceModeIds,
  sanitizeNxdsAppearance,
  sanitizeNxdsAppearancePrefs,
  STROKE_OPTIONS,
  TEXT_SIZE_OPTIONS,
  UI_SCALE_OPTIONS,
} from './appearance-model';
import { deriveTheme } from './derive-theme';

describe('appearance model', () => {
  it('uses the agreed package defaults', () => {
    expect(DEFAULT_NXDS_APPEARANCE).toMatchObject({
      mode: 'light',
      brandColor: DEFAULT_BRAND_COLOR,
      surfaceTone: 'zinc',
      lightContrast: 50,
      darkContrast: 50,
      uiScale: 'default',
      textSize: 14,
      density: 'default',
      corners: 'subtle',
      elevation: 'quiet',
      stroke: 'normal',
      prefs: {
        headingFont: null,
        codeFontSize: 12,
        reduceMotion: false,
        pointerCursors: false,
        fontSmoothing: false,
      },
    });
  });

  it('offers only the supported neutral surface tones', () => {
    expect(BASE_TONE_OPTIONS.map((option) => option.value)).toEqual([
      'stone',
      'neutral',
      'zinc',
      'slate',
      'gray',
    ]);

    expect(Object.keys(BASE_TONE_SEEDS).sort()).toEqual(
      BASE_TONE_OPTIONS.map((option) => option.value).sort()
    );
  });

  it('keeps every surface tone seed shaped for light and dark derivation', () => {
    for (const seeds of Object.values(BASE_TONE_SEEDS)) {
      expect(Object.keys(seeds.light).sort()).toEqual([
        'background',
        'foreground',
      ]);
      expect(Object.keys(seeds.dark).sort()).toEqual([
        'background',
        'foreground',
      ]);
    }
  });

  it('maps friendly layout labels to token axes', () => {
    expect(DENSITY_OPTIONS).toEqual([
      { value: 'tight', label: 'Tight' },
      { value: 'compact', label: 'Compact' },
      { value: 'default', label: 'Default' },
      { value: 'comfortable', label: 'Comfortable' },
      { value: 'relaxed', label: 'Relaxed' },
      { value: 'spacious', label: 'Spacious' },
    ]);
    expect(CORNER_OPTIONS).toEqual([
      { value: 'square', label: 'Square' },
      { value: 'subtle', label: 'Subtle' },
      { value: 'smooth', label: 'Smooth' },
      { value: 'round', label: 'Round' },
      { value: 'extra-round', label: 'Extra Round' },
    ]);
    expect(ELEVATION_OPTIONS).toEqual([
      { value: 'flat', label: 'Flat' },
      { value: 'quiet', label: 'Quiet' },
      { value: 'soft', label: 'Soft' },
      { value: 'standard', label: 'Standard' },
      { value: 'strong', label: 'Strong' },
    ]);
    expect(STROKE_OPTIONS).toEqual([
      { value: 'fine', label: 'Fine' },
      { value: 'normal', label: 'Normal' },
      { value: 'strong', label: 'Strong' },
    ]);
  });
});

describe('sanitizeNxdsAppearance', () => {
  it('falls back to default on non-object payloads', () => {
    expect(sanitizeNxdsAppearance(null)).toEqual(DEFAULT_NXDS_APPEARANCE);
    expect(sanitizeNxdsAppearance('x')).toEqual(DEFAULT_NXDS_APPEARANCE);
  });

  it('passes a valid state through unchanged', () => {
    const valid = {
      ...DEFAULT_NXDS_APPEARANCE,
      mode: 'system' as const,
      brandColor: '#2563eb',
      surfaceTone: 'slate' as const,
      lightContrast: 42,
      darkContrast: 82,
      uiScale: 'large' as const,
      textSize: 16 as const,
      density: 'tight' as const,
      corners: 'extra-round' as const,
      elevation: 'flat' as const,
      stroke: 'fine' as const,
      prefs: {
        ...DEFAULT_NXDS_APPEARANCE.prefs,
        headingFont: '"Lora Variable", Georgia, serif',
        codeFontSize: 13,
        reduceMotion: true,
        pointerCursors: true,
      },
    };

    expect(sanitizeNxdsAppearance(valid)).toEqual(valid);
  });

  it('accepts every shipped layout mode', () => {
    for (const option of UI_SCALE_OPTIONS) {
      expect(sanitizeNxdsAppearance({ uiScale: option.value }).uiScale).toBe(
        option.value
      );
    }

    for (const { value: textSize } of TEXT_SIZE_OPTIONS) {
      expect(sanitizeNxdsAppearance({ textSize }).textSize).toBe(textSize);
    }

    for (const option of DENSITY_OPTIONS) {
      expect(sanitizeNxdsAppearance({ density: option.value }).density).toBe(
        option.value
      );
    }

    for (const option of CORNER_OPTIONS) {
      expect(sanitizeNxdsAppearance({ corners: option.value }).corners).toBe(
        option.value
      );
    }

    for (const option of ELEVATION_OPTIONS) {
      expect(
        sanitizeNxdsAppearance({ elevation: option.value }).elevation
      ).toBe(option.value);
    }
  });

  it('rejects prototype-chain keys as tones', () => {
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        surfaceTone: 'toString',
      }).surfaceTone
    ).toBe('zinc');
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        surfaceTone: 'hasOwnProperty',
      }).surfaceTone
    ).toBe('zinc');
  });

  it('rejects invalid brand color, contrast, and enum values', () => {
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        brandColor: 'not-a-color',
      }).brandColor
    ).toBe(DEFAULT_BRAND_COLOR);
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        lightContrast: 999,
      }).lightContrast
    ).toBe(100);
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        uiScale: 'huge',
      }).uiScale
    ).toBe('default');
    for (const textSize of [11, 17, 14.5, '16']) {
      expect(
        sanitizeNxdsAppearance({ ...DEFAULT_NXDS_APPEARANCE, textSize })
          .textSize,
        String(textSize)
      ).toBe(14);
    }
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        density: 'wat',
      }).density
    ).toBe('default');
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        corners: 'pill',
      }).corners
    ).toBe('subtle');
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        elevation: 'dramatic',
      }).elevation
    ).toBe('quiet');
  });

  it('normalizes a persisted density codename to its friendly value', () => {
    expect(sanitizeNxdsAppearance({ density: 'nova' }).density).toBe('compact');
  });

  it('normalizes a persisted elevation codename to its friendly value', () => {
    expect(sanitizeNxdsAppearance({ elevation: 'maia' }).elevation).toBe(
      'quiet'
    );
  });

  it('normalizes a persisted corner codename to its friendly value', () => {
    expect(sanitizeNxdsAppearance({ corners: 'mellow' }).corners).toBe('round');
  });

  it('normalizes a persisted stroke codename to its friendly value', () => {
    expect(sanitizeNxdsAppearance({ stroke: 'maia' }).stroke).toBe('fine');
  });

  it('preserves system mode verbatim', () => {
    expect(
      sanitizeNxdsAppearance({
        ...DEFAULT_NXDS_APPEARANCE,
        mode: 'system',
      }).mode
    ).toBe('system');
  });
});

describe('normalizeAppearanceModeIds', () => {
  it('is identity on already-friendly values and non-strings', () => {
    expect(
      normalizeAppearanceModeIds({ density: 'compact', corners: 7 })
    ).toMatchObject({ density: 'compact', corners: 7 });
  });

  it('passes non-records through unchanged', () => {
    expect(normalizeAppearanceModeIds('nope')).toBe('nope');
  });
});

describe('sanitizeNxdsAppearancePrefs', () => {
  it('clamps the code font size into [8,32] and falls back to 12', () => {
    expect(sanitizeNxdsAppearancePrefs({ codeFontSize: 99 }).codeFontSize).toBe(
      32
    );
    expect(sanitizeNxdsAppearancePrefs({ codeFontSize: 2 }).codeFontSize).toBe(
      8
    );
    expect(sanitizeNxdsAppearancePrefs({ codeFontSize: 0 }).codeFontSize).toBe(
      12
    );
  });

  it('falls back per preference field without restoring the whole object', () => {
    const result = sanitizeNxdsAppearancePrefs({
      uiFont: 'Inter',
      codeFont: 123,
      reduceMotion: 'on',
      pointerCursors: true,
      fontSmoothing: 'yes',
    });

    expect(result).toEqual({
      ...DEFAULT_NXDS_APPEARANCE.prefs,
      uiFont: 'Inter',
      pointerCursors: true,
    });
  });

  it('keeps a null heading font, which follows the UI font', () => {
    expect(
      sanitizeNxdsAppearancePrefs({ headingFont: null }).headingFont
    ).toBeNull();
    expect(
      sanitizeNxdsAppearancePrefs({ headingFont: 'Lora' }).headingFont
    ).toBe('Lora');
    expect(sanitizeNxdsAppearancePrefs({ headingFont: 7 }).headingFont).toBe(
      DEFAULT_NXDS_APPEARANCE.prefs.headingFont
    );
  });

  it('rejects font families with CSS-breaking characters', () => {
    // appearancePrefsToCss interpolates these into a <style> rule.
    expect(
      sanitizeNxdsAppearancePrefs({ uiFont: 'Inter } body { display:none' })
        .uiFont
    ).toBe(DEFAULT_NXDS_APPEARANCE.prefs.uiFont);
    expect(
      sanitizeNxdsAppearancePrefs({ codeFont: 'Mono; color:red' }).codeFont
    ).toBe(DEFAULT_NXDS_APPEARANCE.prefs.codeFont);
    expect(
      sanitizeNxdsAppearancePrefs({ headingFont: 'Lora</style>' }).headingFont
    ).toBe(DEFAULT_NXDS_APPEARANCE.prefs.headingFont);
  });
});

describe('createNxdsThemeContract', () => {
  it('puts brand color on both light and dark accent seeds', () => {
    const contract = createNxdsThemeContract({
      ...DEFAULT_NXDS_APPEARANCE,
      brandColor: '#ff0000',
    });

    expect(contract.light.accent).toBe('#ff0000');
    expect(contract.dark.accent).toBe('#ff0000');
  });

  it('pulls background and foreground seeds from the selected surface tone', () => {
    const contract = createNxdsThemeContract({
      ...DEFAULT_NXDS_APPEARANCE,
      surfaceTone: 'slate',
    });

    expect(contract.light.background).toBe(
      BASE_TONE_SEEDS.slate.light.background
    );
    expect(contract.dark.foreground).toBe(
      BASE_TONE_SEEDS.slate.dark.foreground
    );
    expect(contract.surfaceTone).toBe('slate');
    expect(contract.contrast).toEqual({ light: 50, dark: 50 });
  });

  it.each(['stone', 'neutral', 'zinc', 'slate', 'gray'] as const)(
    'round-trips through deriveTheme without missing keys (%s)',
    (surfaceTone) => {
      const contract = createNxdsThemeContract({
        ...DEFAULT_NXDS_APPEARANCE,
        surfaceTone,
      });
      const theme = deriveTheme(contract);

      expect(Object.keys(theme.light).length).toBeGreaterThan(60);
      expect(Object.keys(theme.dark).length).toBe(
        Object.keys(theme.light).length
      );
    }
  );

  describe('contrast fields', () => {
    const clean = (patch: Record<string, unknown>) =>
      sanitizeNxdsAppearance({ ...DEFAULT_NXDS_APPEARANCE, ...patch });

    it('accepts independent light/dark values', () => {
      expect(clean({ lightContrast: 37, darkContrast: 82 })).toMatchObject({
        lightContrast: 37,
        darkContrast: 82,
      });
    });

    it.each([
      [-5, 0],
      [999, 100],
      [42.4, 42],
    ])('clamps and rounds finite contrast %s to %s', (value, expected) => {
      expect(clean({ lightContrast: value }).lightContrast).toBe(expected);
    });

    it.each([
      Number.NaN,
      Infinity,
      -Infinity,
      '50',
      'x',
      'toString',
      null,
      undefined,
    ])('uses 50 for an invalid contrast preference: %s', (value) => {
      expect(clean({ lightContrast: value, darkContrast: 82 })).toMatchObject({
        lightContrast: 50,
        darkContrast: 82,
      });
    });

    it('does NOT migrate a pre-split scalar `contrast` key — resets to defaults', () => {
      const result = sanitizeNxdsAppearance({
        mode: 'light',
        brandColor: '#0a0a0a',
        surfaceTone: 'stone',
        contrast: 85, // pre-flat persisted value; intentionally dropped (pre-production, no shim)
        density: 'default',
        corners: 'square',
        elevation: 'quiet',
        stroke: 'normal',
        prefs: DEFAULT_NXDS_APPEARANCE.prefs,
      });
      expect(result).toMatchObject({
        lightContrast: 50,
        darkContrast: 50,
      });
    });
  });
});

describe('appearancePrefsToCss', () => {
  const prefs = DEFAULT_NXDS_APPEARANCE.prefs;
  const codeSizePattern = /--nx-typography-code-size:\s*[^;]+;/;

  it('keeps every typography dimension in px, which the UI scale multiplies', () => {
    const dimensions = [
      ...Object.entries(typographyTokens.size),
      ...Object.entries(typographyTokens['line-height']),
    ];
    const nonPx = dimensions
      .filter(([, token]) => token.$value.unit !== 'px')
      .map(([name, token]) => `${name}: ${token.$value.unit}`);

    expect(nonPx).toEqual([]);
  });

  it('emits the font variables and a clamped code size', () => {
    const css = appearancePrefsToCss({
      ...prefs,
      uiFont: 'Inter',
      codeFont: 'JetBrains Mono',
      codeFontSize: 99,
    });

    expect(css).toContain('--nx-typography-family-font-sans: Inter;');
    expect(css).toContain('--nx-typography-family-font-mono: JetBrains Mono;');
    expect(css).toContain(
      '--nx-typography-family-font-heading: var(--nx-typography-family-font-sans);'
    );
    expect(css).toContain('--nx-typography-code-size: 32px;');
  });

  /** The code size the prefs CSS writes for each other UI scale. */
  function scaledCodeSizes(codeFontSize: number) {
    const css = appearancePrefsToCss({ ...prefs, codeFontSize });
    return Object.fromEntries(
      [
        ...css.matchAll(
          /\[data-ui-scale='([a-z]+)'\] \{\s*--nx-typography-code-size: ([\d.]+)px;/g
        ),
      ].map(([, scale, px]) => [scale, Number(px)])
    );
  }

  it('grows the code size with the label text at each UI scale', () => {
    // 12px at the Default scale, times 12/14, 16/14 and 18/14, rounded.
    expect(scaledCodeSizes(12)).toEqual({ small: 10, large: 14, larger: 15 });
  });

  it('never shrinks code below 8px, and keeps smaller code from growing at Small', () => {
    expect(scaledCodeSizes(9)).toMatchObject({ small: 8 });
    expect(scaledCodeSizes(8)).toMatchObject({ small: 8 });
  });

  it('writes the code size in whole px at every scale', () => {
    const css = appearancePrefsToCss({ ...prefs, codeFontSize: 12.5 });
    expect(css.match(codeSizePattern)?.[0]).toBe(
      '--nx-typography-code-size: 13px;'
    );
    for (const [scale, px] of Object.entries(scaledCodeSizes(12.5))) {
      expect(Number.isInteger(px), scale).toBe(true);
    }
  });

  it('grows the code size with the text size at each UI scale', () => {
    const css = appearancePrefsToCss({ ...prefs, codeFontSize: 12 });
    const sizes = Object.fromEntries(
      [
        ...css.matchAll(
          /^((?:\[data-[a-z-]+='[a-z0-9]+'\])+) \{\s*--nx-typography-code-size: (\d+)px;/gm
        ),
      ].map(([, selector, px]) => [selector, Number(px)])
    );
    // 12px times 16/14 at the Default scale, times 16/14 × 18/14 at Larger,
    // and never under 8px.
    expect(sizes).toMatchObject({
      "[data-text-size='16']": 14,
      "[data-ui-scale='larger'][data-text-size='16']": 18,
      "[data-ui-scale='small'][data-text-size='12']": 9,
    });
    // One block for each scale and text size except Default and 14.
    expect(Object.keys(sizes)).toHaveLength(
      UI_SCALE_OPTIONS.length * TEXT_SIZE_OPTIONS.length - 1
    );
  });

  it('leaves the UI type scale to the [data-ui-scale] blocks', () => {
    expect(appearancePrefsToCss(prefs)).not.toMatch(
      /--nx-typography-(?:size-|line-height-)/
    );
  });

  it('emits a chosen heading font in place of the UI font', () => {
    const css = appearancePrefsToCss({ ...prefs, headingFont: 'Lora' });

    expect(css).toContain('--nx-typography-family-font-heading: Lora;');
  });

  it('leaves the page font size alone', () => {
    const rootBlock = appearancePrefsToCss(prefs).match(/:root \{[^}]*\}/)?.[0];
    expect(rootBlock).toBeDefined();
    expect(rootBlock).not.toMatch(/^\s*font-size:/m);
  });

  it('touches the host page only for the toggles the user turns on', () => {
    const css = appearancePrefsToCss(DEFAULT_NXDS_APPEARANCE.prefs);
    const selectors = [...css.matchAll(/([^{};]+)\{/g)].flatMap(
      ([, list = '']) => list.split(',').map((selector) => selector.trim())
    );
    for (const selector of selectors) {
      expect(selector, selector).toMatch(
        /^(@layer nx-runtime|:root|(\[data-(ui-scale|text-size)='[a-z0-9]+'\])+)$/
      );
    }
  });

  it('pairs -moz-osx-font-smoothing with the -webkit property', () => {
    const on = appearancePrefsToCss({
      ...prefs,
      fontSmoothing: true,
    });
    expect(on).toContain('-webkit-font-smoothing: antialiased');
    expect(on).toContain('-moz-osx-font-smoothing: grayscale');

    const off = appearancePrefsToCss({
      ...prefs,
      fontSmoothing: false,
    });
    expect(off).not.toContain('font-smoothing');
  });

  it('keeps the default code size in parity with the generated token', () => {
    const generatedCss = readFileSync(
      resolve(process.cwd(), 'packages/tailwind/variables.css'),
      'utf8'
    );

    expect(appearancePrefsToCss(prefs).match(codeSizePattern)?.[0]).toBe(
      generatedCss.match(codeSizePattern)?.[0]
    );
  });

  it('emits the reduced-motion block only when reduceMotion is on', () => {
    expect(appearancePrefsToCss({ ...prefs, reduceMotion: true })).toContain(
      'transition-duration: 0.01ms'
    );
    expect(
      appearancePrefsToCss({ ...prefs, reduceMotion: false })
    ).not.toContain('0.01ms');
  });

  it('emits the pointer cursor rule only when pointer cursors are enabled', () => {
    expect(appearancePrefsToCss({ ...prefs, pointerCursors: true })).toContain(
      'cursor: pointer'
    );
    expect(
      appearancePrefsToCss({ ...prefs, pointerCursors: false })
    ).not.toContain('cursor: pointer');
  });
});
