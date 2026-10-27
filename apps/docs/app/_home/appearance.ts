import {
  DEFAULT_NXDS_APPEARANCE,
  FONT_OPTIONS,
  type NxdsAppearanceMode,
  type NxdsAppearanceState,
  sanitizeNxdsAppearance,
} from '@nxds/core';

// Taken from the catalogue, not spelled out, so the Customize font picker
// names it; a catalogue without DM Sans fails the build here.
const dmSans = FONT_OPTIONS.find(({ value }) => value === 'dm-sans');
if (!dmSans) throw new Error('FONT_OPTIONS no longer offers DM Sans.');
const DM_SANS_FAMILY = dmSans.family;

/** The look the homepage opens with, and the one Customize › Reset returns to. */
export function homeAppearance(
  mode: NxdsAppearanceMode = 'dark'
): NxdsAppearanceState {
  return sanitizeNxdsAppearance({
    ...DEFAULT_NXDS_APPEARANCE,
    mode,
    surfaceTone: 'neutral',
    corners: 'smooth',
    prefs: {
      ...DEFAULT_NXDS_APPEARANCE.prefs,
      uiFont: DM_SANS_FAMILY,
      uiFontSize: 16,
    },
  });
}

export const HOME_APPEARANCE = homeAppearance();
