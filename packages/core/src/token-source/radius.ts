import { FULL_RADIUS, type ModeToken } from './ui-scale.ts';

/** The corner modes, each named by its `md` radius in px at the Default UI scale. */
export const CORNER_MODES = [
  '0',
  '2',
  '4',
  '6',
  '8',
  '10',
  '12',
  '14',
  '16',
] as const;

export type CornerMode = (typeof CORNER_MODES)[number];

/** Each radius step as a multiple of its mode's `md`. `full` stays a pill. */
export const RADIUS_RATIOS = {
  base: 1,
  sm: 0.75,
  md: 1,
  lg: 1.25,
  xl: 1.5,
  '2xl': 2,
  '3xl': 3,
  '4xl': 4,
} as const;

/** A mode's steps before rounding, for the UI scale to round once. */
export function exactRadii(mode: CornerMode): ModeToken[] {
  return [
    ...Object.entries(RADIUS_RATIOS).map(([step, ratio]) => ({
      cssName: `radius-${step}`,
      value: `${Number(mode) * ratio}px`,
    })),
    { cssName: 'radius-full', value: FULL_RADIUS },
  ];
}
