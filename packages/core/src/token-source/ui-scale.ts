/**
 * The sizes of each UI scale. `spacing` multiplies every density and radius
 * step, `text` is the 14px label size at that scale, and `icon` is the
 * default icon glyph.
 */
export const UI_SCALES = {
  small: { spacing: 0.9, text: 12, icon: 14 },
  default: { spacing: 1, text: 14, icon: 16 },
  large: { spacing: 1.1, text: 16, icon: 18 },
  larger: { spacing: 1.25, text: 18, icon: 20 },
} as const;

type UiScale = keyof typeof UI_SCALES;

export interface ScaleToken {
  cssName: string;
  value: string;
}

export interface ScaleBlock {
  selectors: string[];
  tokens: ScaleToken[];
}

const FULL_RADIUS = '9999px';

/** No text gets smaller than this, at any scale. */
const MIN_TEXT_PX = 10;

const px = (value: string) => Number.parseFloat(value);

/** A length at a scale: whole px below 16px, even px from 16px. */
export function scaleLength(value: number, factor: number): number {
  const scaled = value * factor;
  return scaled >= 16 ? 2 * Math.round(scaled / 2) : Math.round(scaled);
}

/** The smallest length the rule allows that is larger than `previous`. */
function above(previous: number) {
  const next = previous + 1;
  return next >= 16 && next % 2 === 1 ? next + 1 : next;
}

const stepOf = (cssName: string) =>
  Number(cssName.replace('spacing-', '').replace('_', '.'));

/**
 * Scales one density or radius mode. Numeric spacing steps stay in order: a
 * step that rounds onto the one before it moves up to the next allowed length.
 */
function scaleMode(
  tokens: readonly ScaleToken[],
  factor: number
): ScaleToken[] {
  const scaled = tokens.map(({ cssName, value }) => ({
    cssName,
    value:
      value === FULL_RADIUS ? value : `${scaleLength(px(value), factor)}px`,
  }));
  const steps = scaled
    .filter(({ cssName }) => /^spacing-\d/.test(cssName))
    .sort((a, b) => stepOf(a.cssName) - stepOf(b.cssName));
  let previous = -1;
  for (const step of steps) {
    const value = px(step.value) > previous ? px(step.value) : above(previous);
    step.value = `${value}px`;
    previous = value;
  }
  return scaled;
}

const scaleAttr = (scale: UiScale) => `[data-ui-scale="${scale}"]`;

/**
 * One block per scale and mode of a moded family. The default mode also
 * answers the bare scale selector, so a root with no mode attribute scales
 * too. Modes nest under the scale, which sits on the root.
 */
export function scaledModeBlocks(
  modesByName: Readonly<Record<string, readonly ScaleToken[]>>,
  { attrName, defaultMode }: { attrName: string; defaultMode: string }
): ScaleBlock[] {
  const entries = Object.entries(modesByName);
  const modes = [
    ...entries.filter(([mode]) => mode === defaultMode),
    ...entries
      .filter(([mode]) => mode !== defaultMode)
      .sort(([a], [b]) => a.localeCompare(b)),
  ];
  return nonDefaultScales().flatMap((scale) =>
    modes.map(([mode, tokens]) => {
      const modeAttr = `[${attrName}="${mode}"]`;
      const selectors = [
        `${scaleAttr(scale)}${modeAttr}`,
        `${scaleAttr(scale)} ${modeAttr}`,
      ];
      if (mode === defaultMode) selectors.unshift(scaleAttr(scale));
      return {
        selectors,
        tokens: scaleMode(tokens, UI_SCALES[scale].spacing),
      };
    })
  );
}

/** A `rem` width at a factor. A maximum width needs no rounding. */
const remAt = (rem: number, factor: number) =>
  `${Number((rem * factor).toFixed(4))}rem`;

/** The scale factor and the page widths (`max-w-*`, `w-*`) at that factor. */
function widthTokens(widths: Readonly<Record<string, number>>, factor: number) {
  return [
    { cssName: 'ui-scale', value: String(factor) },
    ...Object.entries(widths).map(([name, rem]) => ({
      cssName: `container-${name}`,
      value: remAt(rem, factor),
    })),
  ];
}

/**
 * The `:root` block with the default factor and page widths, then one block
 * per scale with the text sizes (whole px, 10px or more), the line heights (even px, so a
 * box that grows with its text stays even), the icon glyphs, the page widths
 * and the factor. `sizes` leaves out the code size, which the code font size
 * setting owns.
 */
export function scaleBlocks({
  sizes,
  lineHeights,
  widths,
}: {
  sizes: Readonly<Record<string, number>>;
  lineHeights: Readonly<Record<string, number>>;
  widths: Readonly<Record<string, number>>;
}): ScaleBlock[] {
  const root = {
    selectors: [':root'],
    tokens: widthTokens(widths, UI_SCALES.default.spacing),
  };
  return [
    root,
    ...nonDefaultScales().map((scale) => {
      const { spacing, text, icon } = UI_SCALES[scale];
      const factor = text / UI_SCALES.default.text;
      const tokens = [
        ...Object.entries(sizes).map(([name, value]) => ({
          cssName: `typography-size-${name}`,
          value: `${Math.max(MIN_TEXT_PX, Math.round(value * factor))}px`,
        })),
        ...Object.entries(lineHeights).map(([name, value]) => ({
          cssName: `typography-line-height-${name}`,
          value: `${2 * Math.round((value * factor) / 2)}px`,
        })),
        { cssName: 'icon-glyph-xs', value: `${icon - 4}px` },
        { cssName: 'icon-glyph-sm', value: `${icon - 2}px` },
        { cssName: 'icon-glyph-default', value: `${icon}px` },
        ...widthTokens(widths, spacing),
      ];
      return { selectors: [scaleAttr(scale)], tokens };
    }),
  ];
}

function nonDefaultScales() {
  return (Object.keys(UI_SCALES) as UiScale[]).filter(
    (scale) => scale !== 'default'
  );
}
