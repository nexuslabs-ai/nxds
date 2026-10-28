// Generated from packages/core/tokens by scripts/generate-token-scales.js.
// Run `pnpm --filter @nxds/core generate:scales` after editing the tokens.

/** The spacing scale. Each step has its own `--nx-spacing-*` variable. */
export const SPACING_STEPS = [
  0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24,
  28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 96,
] as const;

/** A step on the spacing scale. */
export type SpacingStep = (typeof SPACING_STEPS)[number];

/** The primitive colour palettes that have a shade ramp. */
export const PRIMITIVE_PALETTE_NAMES = [
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'slate',
  'rose',
  'lime',
  'yellow',
  'blue',
  'gray',
  'zinc',
  'neutral',
  'stone',
  'red',
  'orange',
  'amber',
] as const;

export type PrimitivePaletteName = (typeof PRIMITIVE_PALETTE_NAMES)[number];
