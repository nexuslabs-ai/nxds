// The appearance attributes an element on a canvas can carry, with their
// values and defaults from @nxds/core.
import {
  CORNER_OPTIONS,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceDataAttr,
  STROKE_OPTIONS,
} from '@nxds/core';

import type { ListFamily } from './tokens.ts';

export interface Preset {
  options: readonly { value: string }[];
  initial: string;
  /** The tokens.json family the attribute swaps. */
  family: ListFamily;
}

export const PRESETS: Record<NxdsAppearanceDataAttr, Preset> = {
  'data-density': {
    options: DENSITY_OPTIONS,
    initial: DEFAULT_NXDS_APPEARANCE.density,
    family: 'spacing',
  },
  'data-radius': {
    options: CORNER_OPTIONS,
    initial: DEFAULT_NXDS_APPEARANCE.corners,
    family: 'radius',
  },
  'data-shadow': {
    options: ELEVATION_OPTIONS,
    initial: DEFAULT_NXDS_APPEARANCE.elevation,
    family: 'shadow',
  },
  'data-borderwidth': {
    options: STROKE_OPTIONS,
    initial: DEFAULT_NXDS_APPEARANCE.stroke,
    family: 'borderWidth',
  },
};

const TABLE_MARKER = '<!-- appearance-presets -->';

/** `readme` with its preset marker replaced by a table of each attribute and its values. */
export function withPresetTable(readme: string) {
  if (!readme.includes(TABLE_MARKER)) {
    throw new Error(`README.md: no ${TABLE_MARKER} line for the preset table.`);
  }
  const rows = Object.entries(PRESETS).map(
    ([attribute, { options }]) =>
      `| \`${attribute}\` | ${options.map(({ value }) => `\`${value}\``).join(', ')} |`
  );
  return readme.replace(
    TABLE_MARKER,
    ['| Attribute | Values |', '| --- | --- |', ...rows].join('\n')
  );
}
