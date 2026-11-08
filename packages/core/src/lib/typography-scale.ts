import typographyTokens from '../../tokens/primitives/typography/typography-default.json';

/** The UI font size, in px, the authored type scale is drawn at. */
export const TYPOGRAPHY_BASE_PX = 14;

function formatPx(value: number): string {
  return `${Number(value.toFixed(4))}px`;
}

/** The type size code text is set at, which the code font size pref writes. */
const CODE_SIZE = 'code';

/**
 * Every type size and line height by variable name, at a UI font size of
 * `uiPx` and a code font size of `codePx`: the authored scale times
 * `uiPx / TYPOGRAPHY_BASE_PX`, and the code size at `codePx`.
 */
export function typographyScale(
  uiPx: number,
  codePx: number
): Map<string, string> {
  const scale = uiPx / TYPOGRAPHY_BASE_PX;
  return new Map([
    ...Object.entries(typographyTokens.size).map(
      ([name, token]) =>
        [
          `--nx-typography-size-${name}`,
          formatPx(name === CODE_SIZE ? codePx : token.$value.value * scale),
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

/** Whether the type size at `path` in the typography primitives is the code size. */
export const isCodeSize = (path: readonly string[]) =>
  path[0] === 'size' && path[1] === CODE_SIZE;
