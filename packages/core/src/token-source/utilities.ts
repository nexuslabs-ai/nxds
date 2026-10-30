import type { CssDeclaration } from './format.ts';

/** One generated `@utility` rule. */
export interface UtilityRule {
  /** The utility name without the `nx:` prefix. */
  name: string;
  /**
   * Nested selectors the declarations apply to, such as `& svg`. Without
   * them, the declarations apply to the element the class sits on.
   */
  selectors?: readonly string[];
  /** The rule body, in order. */
  declarations: CssDeclaration[];
}

const BORDER_WIDTH_SIDES = [
  ['', 'border-style', 'border-width'],
  ['x-', 'border-inline-style', 'border-inline-width'],
  ['y-', 'border-block-style', 'border-block-width'],
  ['t-', 'border-top-style', 'border-top-width'],
  ['r-', 'border-right-style', 'border-right-width'],
  ['b-', 'border-bottom-style', 'border-bottom-width'],
  ['l-', 'border-left-style', 'border-left-width'],
  ['s-', 'border-inline-start-style', 'border-inline-start-width'],
  ['e-', 'border-inline-end-style', 'border-inline-end-width'],
  ['bs-', 'border-block-start-style', 'border-block-start-width'],
  ['be-', 'border-block-end-style', 'border-block-end-width'],
] as const;

/**
 * The per-side `border-width-*` alias utilities one border width `key` (e.g.
 * `default`) emits: `border-width-default`, `border-width-x-default`, …
 * `border-width-be-default`. The `border-{side?}-{key}` spellings are
 * Tailwind's own utilities, built from the `--border-width-{key}` theme key.
 */
export function borderWidthAliasUtilities(key: string): UtilityRule[] {
  const value = `var(--nx-borderwidth-${key})`;
  return BORDER_WIDTH_SIDES.map(([side, styleProperty, widthProperty]) => ({
    name: `border-width-${side}${key}`,
    declarations: [
      { property: styleProperty, value: 'var(--tw-border-style, solid)' },
      { property: widthProperty, value },
    ],
  }));
}

/**
 * The utility a motion duration `key` (e.g. `fast`) emits. Tailwind v4 does
 * not codegen named `duration-*` utilities from theme variables, so each is
 * explicit.
 */
export function durationUtility(key: string): UtilityRule {
  const value = `var(--nx-motion-duration-${key})`;
  return {
    name: `duration-${key}`,
    declarations: [
      { property: '--tw-duration', value },
      { property: 'transition-duration', value },
    ],
  };
}

/**
 * An icon's width and height, and `--nx-icon-size`, the size `icon-stroke`
 * draws the line for.
 */
function iconSizeDeclarations(value: string): CssDeclaration[] {
  return [
    { property: 'width', value },
    { property: 'height', value },
    { property: '--nx-icon-size', value },
  ];
}

/** The `size-icon-*` utility a glyph size `key` (e.g. `glyph-default`) emits. */
export function iconSizeUtility(key: string): UtilityRule {
  return {
    name: `size-icon-${key}`,
    declarations: iconSizeDeclarations(`var(--nx-icon-${key})`),
  };
}

/**
 * `size-icon-[…]`, which sizes an icon no glyph size fits from one length,
 * such as `size-icon-[24px]`. A `var()` needs the `length:` hint.
 */
export const ARBITRARY_ICON_SIZE_UTILITY: UtilityRule = {
  name: 'size-icon-*',
  declarations: iconSizeDeclarations('--value([length])'),
};

/**
 * `icon-stroke` sets the line on an `<svg>` the class sits on or contains,
 * and on each shape inside it, because HugeIcons sets `stroke-width` on every
 * path. The line is the stroke base plus `--nx-icon-size` times the stroke
 * ratio, and an icon without `--nx-icon-size` draws the default glyph's line.
 * `non-scaling-stroke` draws it in screen pixels, whatever the icon's
 * `viewBox`.
 */
export const ICON_STROKE_UTILITY: UtilityRule = {
  name: 'icon-stroke',
  selectors: ['&:is(svg)', '&:is(svg) *', '& svg', '& svg *'],
  declarations: [
    {
      property: 'stroke-width',
      value:
        'calc(var(--nx-icon-stroke-base) + var(--nx-icon-size, var(--nx-icon-glyph-default)) * var(--nx-icon-stroke-ratio))',
    },
    { property: 'vector-effect', value: 'non-scaling-stroke' },
  ],
};

/** The utility an icon token feeds: a glyph size's `size-icon-*`, or `icon-stroke`. */
export function iconUtility(path: readonly string[]): UtilityRule {
  if (path[0] === 'stroke') return ICON_STROKE_UTILITY;
  return iconSizeUtility(path.join('-'));
}

/**
 * The motion tokens emitted as Tailwind's `--default-transition-duration` and
 * `--default-transition-timing-function`.
 */
export const DEFAULT_TRANSITION = {
  duration: 'default',
  ease: 'enter',
} as const;

/** Semantic border tokens keyed by their utility alias, in emit order. */
export const BORDER_COLOR_ALIAS_TOKENS = {
  default: 'border-default',
  'default-alpha': 'border-default-alpha',
  focus: 'border-focus',
  disabled: 'border-disabled',
  warning: 'warning-border',
  'warning-active': 'border-warning-active',
  success: 'success-border',
  'success-active': 'border-success-active',
  error: 'error-border',
  'error-active': 'border-error-active',
  information: 'information-border',
  'information-active': 'border-information-active',
  primary: 'primary-border',
  'primary-active': 'primary-border-active',
} as const;

export const BORDER_COLOR_ALIAS_NAMES = Object.keys(BORDER_COLOR_ALIAS_TOKENS);

/** The utility alias for a semantic color name (without the CSS prefix). */
export function borderColorAliasName(tokenName: string): string | null {
  return (
    Object.entries(BORDER_COLOR_ALIAS_TOKENS).find(
      ([, token]) => token === tokenName
    )?.[0] ?? null
  );
}
