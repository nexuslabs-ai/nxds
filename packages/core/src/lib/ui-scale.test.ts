import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  appearancePrefsToCss,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  UI_SCALE_OPTIONS,
} from './appearance-model';

const nxdsCss = readFileSync(
  resolve(process.cwd(), 'packages/tailwind/nxds.css'),
  'utf8'
);

/** The numeric declarations of every `[data-ui-scale]` rule, merged per selector. */
const blocks = new Map<string, Map<string, number>>();
for (const [, selectors, body] of nxdsCss.matchAll(
  /\n\s*(\[data-ui-scale=[^{]*?)\s*\{([^}]*)\}/g
)) {
  for (const selector of selectors!.split(',').map((part) => part.trim())) {
    const declarations = blocks.get(selector) ?? new Map<string, number>();
    for (const [, name, value] of body!.matchAll(
      /--nx-([\w-]+):\s*([\d.]+)(?:px|rem)?;/g
    )) {
      declarations.set(name!, Number(value));
    }
    blocks.set(selector, declarations);
  }
}

const SCALES = UI_SCALE_OPTIONS.map(({ value }) => value).filter(
  (scale) => scale !== 'default'
);

function spacingBlock(scale: string, density: string) {
  const block = blocks.get(
    `[data-ui-scale='${scale}'][data-density='${density}']`
  );
  if (!block) throw new Error(`no ${scale} × ${density} spacing block`);
  return block;
}

const stepOf = (name: string) =>
  Number(name.replace('spacing-', '').replace('_', '.'));

describe('UI scale CSS', () => {
  it('emits nothing for the default scale', () => {
    expect(nxdsCss).not.toContain("[data-ui-scale='default']");
  });

  it('keeps every density step in order, whole below 16px and even from it', () => {
    for (const scale of SCALES) {
      for (const { value: density } of DENSITY_OPTIONS) {
        const steps = [...spacingBlock(scale, density)]
          .filter(([name]) => /^spacing-\d/.test(name))
          .sort(([a], [b]) => stepOf(a) - stepOf(b))
          .map(([, px]) => px);
        const label = `${scale} × ${density}`;
        expect(steps.length, label).toBeGreaterThan(30);
        steps.forEach((px, index) => {
          expect(Number.isInteger(px), `${label}: ${px}`).toBe(true);
          if (px >= 16) expect(px % 2, `${label}: ${px}`).toBe(0);
          if (index > 0) expect(px, label).toBeGreaterThan(steps[index - 1]!);
        });
      }
    }
  });

  it('sizes a default Button 36, 44 and 50px at the Default density', () => {
    expect(
      SCALES.map((scale) => spacingBlock(scale, 'default').get('spacing-10'))
    ).toEqual([36, 44, 50]);
  });

  it('gives a root with no density the Default density at that scale', () => {
    for (const scale of SCALES) {
      expect(blocks.get(`[data-ui-scale='${scale}']`)?.get('spacing-10')).toBe(
        spacingBlock(scale, 'default').get('spacing-10')
      );
    }
  });

  it('scales the page widths and the factor with the spacing', () => {
    const [small, large, larger] = SCALES.map(
      (scale) => blocks.get(`[data-ui-scale='${scale}']`)!
    );
    expect(
      [small, large, larger].map((block) => block!.get('ui-scale'))
    ).toEqual([0.9, 1.1, 1.25]);
    // `max-w-lg` is 32rem at the Default scale.
    expect(
      [small, large, larger].map((block) => block!.get('container-lg'))
    ).toEqual([28.8, 35.2, 40]);
    const widths = [...larger!].filter(([name]) =>
      /^container-(\d?x[sl]|sm|md|lg)$/.test(name)
    );
    expect(widths).toHaveLength(13);
    for (const [name, rem] of widths) {
      expect(rem / small!.get(name)!, name).toBeCloseTo(1.25 / 0.9, 4);
    }
  });

  it('scales text to 12, 16 and 18px, never under 8px, with even line heights', () => {
    const type = SCALES.map(
      (scale) => blocks.get(`[data-ui-scale='${scale}']`)!
    );
    expect(type.map((block) => block.get('typography-size-sm'))).toEqual([
      12, 16, 18,
    ]);
    for (const block of type) {
      for (const [name, px] of block) {
        if (/^typography-(size-|code-size)/.test(name)) {
          expect(Number.isInteger(px), name).toBe(true);
          expect(px, name).toBeGreaterThanOrEqual(8);
        }
        if (name.startsWith('typography-line-height-')) {
          expect(px % 2, name).toBe(0);
        }
      }
    }
  });

  it('keeps every type size larger than the one below it', () => {
    for (const scale of SCALES) {
      const sizes = [...blocks.get(`[data-ui-scale='${scale}']`)!]
        .filter(([name]) => name.startsWith('typography-size-'))
        .map(([, px]) => px);
      sizes.slice(1).forEach((px, index) => {
        expect(px, `${scale}: ${sizes.join(', ')}`).toBeGreaterThan(
          sizes[index]!
        );
      });
    }
  });

  it('scales the default 12px code text to 10, 14 and 15px', () => {
    expect(
      SCALES.map((scale) =>
        blocks.get(`[data-ui-scale='${scale}']`)!.get('typography-code-size')
      )
    ).toEqual([10, 14, 15]);
  });

  it('sets the same code size as the provider at the default setting', () => {
    const provider = appearancePrefsToCss(DEFAULT_NXDS_APPEARANCE.prefs);
    for (const scale of SCALES) {
      const px = blocks
        .get(`[data-ui-scale='${scale}']`)!
        .get('typography-code-size');
      expect(provider).toContain(
        `[data-ui-scale='${scale}'] {\n  --nx-typography-code-size: ${px}px;\n}`
      );
    }
  });

  it('scales every icon glyph to even px, so it centers in an even box', () => {
    const glyph = (name: string) =>
      SCALES.map((scale) =>
        blocks.get(`[data-ui-scale='${scale}']`)!.get(`icon-glyph-${name}`)
      );
    expect(glyph('xs')).toEqual([10, 14, 16]);
    expect(glyph('sm')).toEqual([12, 16, 18]);
    expect(glyph('default')).toEqual([14, 18, 20]);
    expect(glyph('lg')).toEqual([22, 28, 30]);
    for (const scale of SCALES) {
      for (const [name, px] of blocks.get(`[data-ui-scale='${scale}']`)!) {
        if (name.startsWith('icon-glyph-')) expect(px % 2, name).toBe(0);
      }
    }
  });
});
