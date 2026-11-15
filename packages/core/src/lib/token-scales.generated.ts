// Generated from packages/core/tokens and Tailwind's theme by scripts/generate-token-scales.js.
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

/** Tailwind's page widths in rem, by name. The UI scale multiplies them. */
export const PAGE_WIDTHS_REM = {
  '3xs': 16,
  '2xs': 18,
  xs: 20,
  sm: 24,
  md: 28,
  lg: 32,
  xl: 36,
  '2xl': 42,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
  '6xl': 72,
  '7xl': 80,
} as const;
