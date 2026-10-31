import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import typographyTokens from '../../tokens/primitives/typography/typography-default.json';

import {
  appearancePrefsToCss,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  TEXT_SIZE_OPTIONS,
  textSizePx,
  UI_SCALE_OPTIONS,
} from './appearance-model';

const nxdsCss = readFileSync(
  resolve(process.cwd(), 'packages/tailwind/nxds.css'),
  'utf8'
);

/**
 * The numeric declarations of every `[data-ui-scale]` and `[data-text-size]`
 * rule, merged per selector.
 */
const blocks = new Map<string, Map<string, number>>();
for (const [, selectors, body] of nxdsCss.matchAll(
  /\n\s*(\[data-(?:ui-scale|text-size)=[^{]*?)\s*\{([^}]*)\}/g
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

const ALL_SCALES = UI_SCALE_OPTIONS.map(({ value }) => value);
const SCALES = ALL_SCALES.filter((scale) => scale !== 'default');
const ALL_TEXT_SIZES = TEXT_SIZE_OPTIONS.map(({ value }) => value);
/** Every type size and line height, and the code size. */
const TYPE_TOKEN_COUNT =
  Object.keys(typographyTokens.size).length +
  Object.keys(typographyTokens['line-height']).length +
  1;
const TEXT_SIZES = ALL_TEXT_SIZES.filter((textSize) => textSize !== 14);

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

function textSizeBlock(scale: string, textSize: number) {
  const size = `[data-text-size='${textSize}']`;
  const block = blocks.get(
    scale === 'default' ? size : `[data-ui-scale='${scale}']${size}`
  );
  if (!block) throw new Error(`no ${scale} × ${textSize} text size block`);
  return block;
}

/** The label text size the CSS gives `textSize` at `scale`. */
function labelPx(scale: string, textSize: number) {
  if (textSize !== 14) {
    return textSizeBlock(scale, textSize).get('typography-size-sm');
  }
  return scale === 'default'
    ? 14
    : blocks.get(`[data-ui-scale='${scale}']`)?.get('typography-size-sm');
}

describe('Text size CSS', () => {
  it('emits nothing for the default text size', () => {
    expect(nxdsCss).not.toContain("[data-text-size='14']");
  });

  it('sets only type and code at every text size and scale, whole px and even line heights', () => {
    for (const scale of ALL_SCALES) {
      for (const textSize of TEXT_SIZES) {
        const label = `${scale} × ${textSize}`;
        const block = textSizeBlock(scale, textSize);
        expect(block.size, label).toBe(TYPE_TOKEN_COUNT);
        for (const [name, px] of block) {
          expect(name, label).toMatch(
            /^typography-(size-|line-height-|code-size$)/
          );
          expect(Number.isInteger(px), `${label}: ${name}`).toBe(true);
          expect(px, `${label}: ${name}`).toBeGreaterThanOrEqual(8);
          if (name.startsWith('typography-line-height-')) {
            expect(px % 2, `${label}: ${name}`).toBe(0);
          }
        }
      }
    }
  });

  it('sizes the label text to textSize × the scale label size ÷ 14', () => {
    const table = Object.fromEntries(
      ALL_SCALES.map((scale) => [
        scale,
        ALL_TEXT_SIZES.map((textSize) => labelPx(scale, textSize)),
      ])
    );
    expect(table).toEqual({
      small: [10, 11, 12, 13, 14],
      default: [12, 13, 14, 15, 16],
      large: [14, 15, 16, 17, 18],
      larger: [15, 17, 18, 19, 21],
    });
  });

  it('keeps every type size larger than the one below it', () => {
    for (const scale of ALL_SCALES) {
      for (const textSize of ALL_TEXT_SIZES) {
        // The Default scale and text size use the base tokens.
        if (scale === 'default' && textSize === 14) continue;
        const label = `${scale} × ${textSize}`;
        const block =
          textSize === 14
            ? blocks.get(`[data-ui-scale='${scale}']`)!
            : textSizeBlock(scale, textSize);
        const sizes = [...block]
          .filter(([name]) => name.startsWith('typography-size-'))
          .map(([, px]) => px);
        sizes.slice(1).forEach((px, index) => {
          expect(px, `${label}: ${sizes.join(', ')}`).toBeGreaterThan(
            sizes[index]!
          );
        });
      }
    }
  });

  it('gives each text size its own label size at every scale', () => {
    for (const scale of ALL_SCALES) {
      const sizes = ALL_TEXT_SIZES.map((textSize) => labelPx(scale, textSize));
      expect(new Set(sizes).size, scale).toBe(sizes.length);
    }
  });

  it('sets the same code size as the provider at every text size', () => {
    const provider = appearancePrefsToCss(DEFAULT_NXDS_APPEARANCE.prefs);
    for (const scale of ALL_SCALES) {
      for (const textSize of TEXT_SIZES) {
        const px = textSizeBlock(scale, textSize).get('typography-code-size');
        const selector =
          scale === 'default'
            ? `[data-text-size='${textSize}']`
            : `[data-ui-scale='${scale}'][data-text-size='${textSize}']`;
        expect(provider).toContain(
          `${selector} {\n  --nx-typography-code-size: ${px}px;\n}`
        );
      }
    }
  });

  it('labels each picker option with the size the CSS sets', () => {
    for (const scale of ALL_SCALES) {
      for (const textSize of ALL_TEXT_SIZES) {
        expect(textSizePx(textSize, scale), `${scale} × ${textSize}`).toBe(
          labelPx(scale, textSize)
        );
      }
    }
  });
});
