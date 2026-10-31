/**
 * Each UI scale, as factors of the Default scale. `spacing` multiplies every
 * density and radius step and the page widths, `text` every type size, and
 * `icon` every icon glyph. `text: 12 / 14` turns 14px label text into 12px.
 */
export const UI_SCALES = {
  small: { spacing: 0.9, text: 12 / 14, icon: 14 / 16 },
  default: { spacing: 1, text: 1, icon: 1 },
  large: { spacing: 1.1, text: 16 / 14, icon: 18 / 16 },
  larger: { spacing: 1.25, text: 18 / 14, icon: 20 / 16 },
} as const;

export type UiScale = keyof typeof UI_SCALES;

/** Every scale but Default, which writes no block of its own. */
export const NON_DEFAULT_UI_SCALES = (
  Object.keys(UI_SCALES) as UiScale[]
).filter((scale) => scale !== 'default');

/** The selector that matches the root of a UI scale. */
export const uiScaleSelector = (scale: UiScale) => `[data-ui-scale='${scale}']`;

export interface ScaleToken {
  cssName: string;
  value: string;
}

export interface ScaleBlock {
  selectors: string[];
  tokens: ScaleToken[];
}

/** A token of a density or radius mode, before the UI scale. */
export interface ModeToken extends ScaleToken {
  /** The spacing step a role token takes its value from, such as `spacing-6`. */
  step?: string;
}

const FULL_RADIUS = '9999px';

/** No text scales below this size. */
const MIN_TEXT_PX = 8;

const px = (value: string) => Number.parseFloat(value);

const evenPx = (value: number) => 2 * Math.round(value / 2);

/** A length at a scale: whole px below 16px, even px from 16px. */
export function scaleLength(value: number, factor: number): number {
  const scaled = value * factor;
  return scaled >= 16 ? evenPx(scaled) : Math.round(scaled);
}

/** A text size at a scale, in whole px. It stops at 8px. */
export function scaleText(size: number, scale: UiScale): number {
  return Math.max(MIN_TEXT_PX, Math.round(size * UI_SCALES[scale].text));
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
 * A role token takes the scaled value of the step it references.
 */
function scaleMode(tokens: readonly ModeToken[], factor: number): ScaleToken[] {
  const scaled = new Map(
    tokens
      .filter(({ step }) => !step)
      .map(({ cssName, value }) => [
        cssName,
        value === FULL_RADIUS ? value : `${scaleLength(px(value), factor)}px`,
      ])
  );
  const steps = [...scaled]
    .filter(([cssName]) => /^spacing-\d/.test(cssName))
    .sort(([a], [b]) => stepOf(a) - stepOf(b));
  let previous = -1;
  for (const [cssName, value] of steps) {
    const length = px(value) > previous ? px(value) : above(previous);
    scaled.set(cssName, `${length}px`);
    previous = length;
  }
  return tokens.map(({ cssName, step }) => {
    const value = scaled.get(step ?? cssName);
    if (value === undefined) {
      throw new Error(
        `scaleMode: ${cssName} references ${step}, which its mode lacks`
      );
    }
    return { cssName, value };
  });
}

/**
 * One block per scale and mode of a moded family. The default mode also
 * answers the bare scale selector, so a root with no mode attribute scales
 * too. Modes nest under the scale, which sits on the root.
 */
export function scaledModeBlocks(
  modesByName: Readonly<Record<string, readonly ModeToken[]>>,
  { attrName, defaultMode }: { attrName: string; defaultMode: string }
): ScaleBlock[] {
  const entries = Object.entries(modesByName);
  const modes = [
    ...entries.filter(([mode]) => mode === defaultMode),
    ...entries
      .filter(([mode]) => mode !== defaultMode)
      .sort(([a], [b]) => a.localeCompare(b)),
  ];
  return NON_DEFAULT_UI_SCALES.flatMap((scale) =>
    modes.map(([mode, tokens]) => {
      const modeAttr = `[${attrName}='${mode}']`;
      const selectors = [
        `${uiScaleSelector(scale)}${modeAttr}`,
        `${uiScaleSelector(scale)} ${modeAttr}`,
      ];
      if (mode === defaultMode) selectors.unshift(uiScaleSelector(scale));
      return {
        selectors,
        tokens: scaleMode(tokens, UI_SCALES[scale].spacing),
      };
    })
  );
}

/** The scale factor and the page widths (`max-w-*`, `w-*`) at a scale. */
export function widthTokens(
  widths: Readonly<Record<string, number>>,
  scale: UiScale
): ScaleToken[] {
  const factor = UI_SCALES[scale].spacing;
  return [
    { cssName: 'ui-scale', value: String(factor) },
    ...Object.entries(widths).map(([name, rem]) => ({
      cssName: `container-${name}`,
      value: `${Number((rem * factor).toFixed(4))}rem`,
    })),
  ];
}

/** The Default sizes the UI scale multiplies. */
export interface UiScaleBase {
  /** Type sizes in px, by name. */
  sizes: Readonly<Record<string, number>>;
  /** Line heights in px, by name. */
  lineHeights: Readonly<Record<string, number>>;
  /** The code text size in px. */
  codeSize: number;
  /** Icon glyphs in px, by name. */
  glyphs: Readonly<Record<string, number>>;
  /** Page widths in rem, by name. */
  widths: Readonly<Record<string, number>>;
}

/**
 * The `:root` block with the default factor and page widths, then one block
 * per scale with the type sizes and the code size (`scaleText`), the line
 * heights and the icon glyphs (even px), the page widths and the factor.
 */
export function scaleBlocks({
  sizes,
  lineHeights,
  codeSize,
  glyphs,
  widths,
}: UiScaleBase): ScaleBlock[] {
  const root = { selectors: [':root'], tokens: widthTokens(widths, 'default') };
  return [
    root,
    ...NON_DEFAULT_UI_SCALES.map((scale) => {
      const { text, icon } = UI_SCALES[scale];
      const tokens = [
        ...Object.entries(sizes).map(([name, size]) => ({
          cssName: `typography-size-${name}`,
          value: `${scaleText(size, scale)}px`,
        })),
        ...Object.entries(lineHeights).map(([name, lineHeight]) => ({
          cssName: `typography-line-height-${name}`,
          value: `${evenPx(lineHeight * text)}px`,
        })),
        {
          cssName: 'typography-code-size',
          value: `${scaleText(codeSize, scale)}px`,
        },
        ...Object.entries(glyphs).map(([name, glyph]) => ({
          cssName: `icon-glyph-${name}`,
          value: `${evenPx(glyph * icon)}px`,
        })),
        ...widthTokens(widths, scale),
      ];
      return { selectors: [uiScaleSelector(scale)], tokens };
    }),
  ];
}
