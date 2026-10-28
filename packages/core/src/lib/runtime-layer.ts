/**
 * The layer order nxds declares in every stylesheet that layers its CSS. It
 * ranks `nx-runtime` after Tailwind's layers whichever stylesheet loads first.
 */
export const RUNTIME_LAYER_ORDER =
  '@layer properties, theme, base, components, utilities, nx-runtime;';

/**
 * Wrap the provider's runtime CSS in the `nx-runtime` layer, so it overrides
 * the generated `@layer theme` defaults and unlayered CSS overrides it.
 */
export function inRuntimeLayer(css: string): string {
  return `${RUNTIME_LAYER_ORDER}\n@layer nx-runtime {\n${css}\n}\n`;
}
