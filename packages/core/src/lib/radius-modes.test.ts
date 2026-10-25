import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Each corner mode is named by its pixel value. Its sizes are that value times
// a fixed ratio, rounded to whole pixels, so a Card keeps the same proportion
// to a Button in every mode.

const RADIUS_DIR = resolve(
  process.cwd(),
  'packages/core/tokens/primitives/radius'
);
const MODES = ['0', '2', '4', '6', '8', '10', '12', '14', '16'];
const RATIO = {
  sm: 0.75,
  md: 1,
  lg: 1.25,
  xl: 1.5,
  '2xl': 2,
  '3xl': 3,
  '4xl': 4,
};

type RadiusToken = { $value: { value: number; unit: string } };

function radiusFiles() {
  return readdirSync(RADIUS_DIR).filter((file) => file.endsWith('.json'));
}

function readMode(mode: string): Record<string, RadiusToken> {
  return JSON.parse(
    readFileSync(resolve(RADIUS_DIR, `radius-${mode}.json`), 'utf8')
  );
}

function px(token: RadiusToken | undefined) {
  return token?.$value.value;
}

describe('radius modes', () => {
  it('ships one radius file per mode, named by its pixel value', () => {
    expect(radiusFiles().sort()).toEqual(
      MODES.map((mode) => `radius-${mode}.json`).sort()
    );
  });

  it.each(MODES)(
    'mode %s is the proportional ladder in whole pixels',
    (mode) => {
      const tokens = readMode(mode);
      const base = Number(mode);
      expect(px(tokens.base)).toBe(base);
      for (const [step, ratio] of Object.entries(RATIO)) {
        expect(px(tokens[step])).toBe(Math.round(base * ratio));
      }
      expect(px(tokens.full)).toBe(9999);
    }
  );
});
