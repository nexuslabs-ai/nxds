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
 * The utility an icon token emits. A glyph size (e.g. `glyph.default`) emits
 * `size-icon-glyph-default`. The stroke emits `icon-stroke`, which sets the
 * line width on an `<svg>` the class sits on or contains, and on each shape
 * inside it, because HugeIcons sets `stroke-width` on every path.
 */
export function iconUtility(path: readonly string[]): UtilityRule {
  const key = path.join('-');
  const value = `var(--nx-icon-${key})`;
  if (key === 'stroke') {
    return {
      name: 'icon-stroke',
      selectors: ['&:is(svg)', '&:is(svg) *', '& svg', '& svg *'],
      declarations: [{ property: 'stroke-width', value }],
    };
  }
  return {
    name: `size-icon-${key}`,
    declarations: [
      { property: 'width', value },
      { property: 'height', value },
    ],
  };
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
