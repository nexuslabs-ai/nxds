import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceState,
  STROKE_OPTIONS,
} from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { FONT_OPTIONS } from './font-options';

const TEXT_FONTS = FONT_OPTIONS.filter((font) => font.category !== 'mono');

/**
 * A random appearance from nxds's curated options: brand color preset, surface
 * tone, density, corners, elevation, stroke, UI font and heading font. Mode,
 * contrast and the other preferences stay as `state` has them.
 *
 * `random` returns a number in [0, 1), like `Math.random`.
 */
export function shuffleNxdsAppearance(
  state: NxdsAppearanceState,
  random: () => number = Math.random
): NxdsAppearanceState {
  function pick<T>(options: readonly T[]): T {
    const option = options[Math.floor(random() * options.length)];
    if (option === undefined) throw new Error('No option to pick from.');
    return option;
  }

  return {
    ...state,
    brandColor: pick(BRAND_COLOR_PRESETS).color,
    surfaceTone: pick(BASE_TONE_OPTIONS).value,
    density: pick(DENSITY_OPTIONS).value,
    corners: pick(CORNER_OPTIONS).value,
    elevation: pick(ELEVATION_OPTIONS).value,
    stroke: pick(STROKE_OPTIONS).value,
    prefs: {
      ...state.prefs,
      uiFont: pick(TEXT_FONTS).family,
      headingFont: pick([null, ...TEXT_FONTS.map((font) => font.family)]),
    },
  };
}
