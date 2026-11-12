import {
  BASE_TONE_OPTIONS,
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceState,
  STROKE_OPTIONS,
} from './appearance-model';
import { BRAND_COLOR_PRESETS } from './brand-presets';
import { FONT_OPTIONS, type NxdsFontOption } from './font-options';
import { ICON_LIBRARY_OPTIONS, type NxdsIconLibrary } from './icon-libraries';

export interface NxdsShuffleOptions {
  /**
   * The fonts the UI and heading fonts come from. Monospace fonts are skipped,
   * so it needs at least one sans or serif font. Leave it out to pick from
   * every curated font.
   */
  readonly fonts?: readonly NxdsFontOption[];
  /** Returns a number in [0, 1), like `Math.random`. */
  readonly random?: () => number;
}

function pick<T>(options: readonly T[], random: () => number): T {
  const option = options[Math.floor(random() * options.length)];
  if (option === undefined) throw new Error('No option to pick from.');
  return option;
}

/**
 * A random appearance from nxds's curated options: brand color preset, surface
 * tone, density, corners, elevation, stroke, UI font and heading font. Mode,
 * contrast, UI scale and the other preferences stay as `state` has them.
 */
export function shuffleNxdsAppearance(
  state: NxdsAppearanceState,
  { fonts = FONT_OPTIONS, random = Math.random }: NxdsShuffleOptions = {}
): NxdsAppearanceState {
  const textFonts = fonts
    .filter((font) => font.category !== 'mono')
    .map((font) => font.family);
  if (textFonts.length === 0) {
    throw new Error(
      'shuffleNxdsAppearance: `fonts` needs at least one sans or serif font.'
    );
  }

  return {
    ...state,
    brandColor: pick(BRAND_COLOR_PRESETS, random).color,
    surfaceTone: pick(BASE_TONE_OPTIONS, random).value,
    density: pick(DENSITY_OPTIONS, random).value,
    corners: pick(CORNER_OPTIONS, random).value,
    elevation: pick(ELEVATION_OPTIONS, random).value,
    stroke: pick(STROKE_OPTIONS, random).value,
    prefs: {
      ...state.prefs,
      uiFont: pick(textFonts, random),
      headingFont: pick([null, ...textFonts], random),
    },
  };
}

/** A random icon library. */
export function shuffleNxdsIconLibrary({
  random = Math.random,
}: Pick<NxdsShuffleOptions, 'random'> = {}): NxdsIconLibrary {
  return pick(ICON_LIBRARY_OPTIONS, random).value;
}
