// The appearance attributes an element on a canvas can carry, with their
// values and the appearance field each sets, from @nxds/core.
import {
  CORNER_OPTIONS,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  type NxdsAppearanceDataAttr,
  type NxdsAppearanceState,
  type NxdsPresetField,
  STROKE_OPTIONS,
  UI_SCALE_OPTIONS,
} from '@nxds/core';

import type { ListFamily } from './tokens.ts';

export interface Preset {
  options: readonly { value: string }[];
  /** The appearance field whose value the system starts at. */
  field: NxdsPresetField | 'uiScale';
  /** The tokens.json family the attribute swaps. */
  family: ListFamily;
}

export const PRESETS: Record<NxdsAppearanceDataAttr, Preset> = {
  'data-ui-scale': {
    options: UI_SCALE_OPTIONS,
    field: 'uiScale',
    family: 'spacing',
  },
  'data-density': {
    options: DENSITY_OPTIONS,
    field: 'density',
    family: 'spacing',
  },
  'data-radius': {
    options: CORNER_OPTIONS,
    field: 'corners',
    family: 'radius',
  },
  'data-shadow': {
    options: ELEVATION_OPTIONS,
    field: 'elevation',
    family: 'shadow',
  },
  'data-borderwidth': {
    options: STROKE_OPTIONS,
    field: 'stroke',
    family: 'borderWidth',
  },
};

const TABLE_MARKER = '<!-- appearance-presets -->';

/**
 * The presets a system's artboards take: every one, less `data-ui-scale` when
 * the system's theme sets the UI scale.
 */
export function exportPresets({
  uiScale,
}: Pick<NxdsAppearanceState, 'uiScale'>) {
  return (Object.entries(PRESETS) as [NxdsAppearanceDataAttr, Preset][]).filter(
    ([, { field }]) => field !== 'uiScale' || uiScale === 'default'
  );
}

/** `readme` with its preset marker replaced by a table of each attribute and its values. */
export function withPresetTable(
  readme: string,
  presets: readonly [string, Preset][]
) {
  if (!readme.includes(TABLE_MARKER)) {
    throw new Error(`README.md: no ${TABLE_MARKER} line for the preset table.`);
  }
  const rows = presets.map(
    ([attribute, { options }]) =>
      `| \`${attribute}\` | ${options.map(({ value }) => `\`${value}\``).join(', ')} |`
  );
  return readme.replace(
    TABLE_MARKER,
    ['| Attribute | Values |', '| --- | --- |', ...rows].join('\n')
  );
}
