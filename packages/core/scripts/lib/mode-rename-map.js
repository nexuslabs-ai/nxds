// Single source of truth for the Phase E0 token-mode rename (#546).
// Family-scoped by design: the same codename can map to different friendly names
// per family, so consumers must never apply these as global replacements.
export const MODE_RENAME = {
  spacing: {
    nova: 'compact',
    mira: 'default',
    luma: 'comfortable',
    sera: 'spacious',
    lyra: 'tight',
    maia: 'relaxed',
  },
  shadow: {
    maia: 'quiet',
    mira: 'standard',
    nova: 'strong',
    vega: 'flat',
    lyra: 'soft',
  },
  borderwidth: {
    maia: 'fine',
    vega: 'normal',
    nova: 'strong',
  },
  typography: {
    vega: 'default',
  },
};

// Radius modes are named by their pixel value; every earlier name is retired.
export const RETIRED_RADIUS_MODES = [
  'sharp',
  'mellow',
  'blunt',
  'square',
  'subtle',
  'smooth',
  'round',
  'extra-round',
];

export const RETIRED_CODENAMES = [
  ...new Set([
    ...Object.values(MODE_RENAME).flatMap((map) => Object.keys(map)),
    ...RETIRED_RADIUS_MODES,
  ]),
].sort();
