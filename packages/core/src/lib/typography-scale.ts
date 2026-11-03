import typographyTokens from '../../tokens/primitives/typography/typography-default.json';

/** The UI font size, in px, the authored type scale is drawn at. */
export const TYPOGRAPHY_BASE_PX = 14;

function formatPx(value: number): string {
  return `${Number(value.toFixed(4))}px`;
}

/**
 * Every type size and line height at a UI font size of `uiPx`, by variable
 * name: the authored scale times `uiPx / TYPOGRAPHY_BASE_PX`.
 */
export function typographyScale(uiPx: number): Map<string, string> {
  const scale = uiPx / TYPOGRAPHY_BASE_PX;
  return new Map([
    ...Object.entries(typographyTokens.size).map(
      ([name, token]) =>
        [
          `--nx-typography-size-${name}`,
          formatPx(token.$value.value * scale),
        ] as const
    ),
    ...Object.entries(typographyTokens['line-height']).map(
      ([name, token]) =>
        [
          `--nx-typography-line-height-${name}`,
          formatPx(token.$value.value * scale),
        ] as const
    ),
  ]);
}
