import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { CORNER_MODES, RADIUS_RATIOS } from '../token-source/radius';
import {
  NON_DEFAULT_UI_SCALES,
  scaleLength,
  UI_SCALES,
} from '../token-source/ui-scale';

import { CORNER_OPTIONS } from './appearance-model';

const RADIUS_DIR = resolve(
  process.cwd(),
  'packages/core/tokens/primitives/radius'
);
const NXDS_CSS = readFileSync(
  resolve(process.cwd(), 'packages/tailwind/nxds.css'),
  'utf8'
);

type RadiusToken = { $value: { value: number; unit: string } };

function readMode(mode: string): Record<string, RadiusToken> {
  return JSON.parse(
    readFileSync(resolve(RADIUS_DIR, `radius-${mode}.json`), 'utf8')
  );
}

/** The declarations of the generated CSS block that `selector` opens. */
function block(selector: string) {
  const start = NXDS_CSS.indexOf(`${selector} {`);
  expect(start).toBeGreaterThan(-1);
  return NXDS_CSS.slice(start, NXDS_CSS.indexOf('}', start));
}

describe('radius modes', () => {
  it('offers one option per mode and ships one radius file per mode', () => {
    expect(CORNER_OPTIONS.map((option) => option.value)).toEqual(CORNER_MODES);
    expect(
      readdirSync(RADIUS_DIR)
        .filter((file) => file.endsWith('.json'))
        .sort()
    ).toEqual(CORNER_MODES.map((mode) => `radius-${mode}.json`).sort());
  });

  it.each(CORNER_MODES)(
    'mode %s is its value times each ratio, in whole pixels',
    (mode) => {
      const tokens = readMode(mode);
      for (const [step, ratio] of Object.entries(RADIUS_RATIOS)) {
        expect(tokens[step]?.$value.value).toBe(
          Math.round(Number(mode) * ratio)
        );
      }
      expect(tokens.full?.$value.value).toBe(9999);
    }
  );

  it.each(NON_DEFAULT_UI_SCALES)(
    'the %s UI scale rounds each mode step once',
    (scale) => {
      const factor = UI_SCALES[scale].spacing;
      for (const mode of CORNER_MODES) {
        const declarations = block(
          `[data-ui-scale='${scale}'] [data-radius='${mode}']`
        );
        for (const [step, ratio] of Object.entries(RADIUS_RATIOS)) {
          const px = scaleLength(Number(mode) * ratio, factor);
          expect(declarations).toContain(`--nx-radius-${step}: ${px}px;`);
        }
      }
    }
  );
});
