import primitiveColors from '../../tokens/primitives/color.json';
import {
  hexToOklchPinned,
  isPaletteShadeKey,
} from '../token-source/perceptual-grid';

import { type Shade, SHADES } from './palette';
import {
  PRIMITIVE_PALETTE_NAMES,
  type PrimitivePaletteName,
} from './token-scales.generated';

export type PrimitivePaletteRamp = Readonly<Record<Shade, string>>;

const rampCache = new Map<PrimitivePaletteName, PrimitivePaletteRamp>();

export function getPaletteRamp(
  palette: PrimitivePaletteName
): PrimitivePaletteRamp {
  if (!PRIMITIVE_PALETTE_NAMES.includes(palette)) {
    throw new Error(`palette: unknown primitive palette "${palette}"`);
  }
  const cached = rampCache.get(palette);
  if (cached) return cached;
  const ramp = Object.freeze(
    Object.fromEntries(
      SHADES.map((shade) => [
        shade,
        hexToOklchPinned(
          primitiveColors[palette][shade].$value,
          shade,
          palette
        ),
      ])
    ) as Record<Shade, string>
  );
  rampCache.set(palette, ramp);
  return ramp;
}

export function getPaletteShade(
  palette: PrimitivePaletteName,
  shade: Shade
): string {
  if (!isPaletteShadeKey(shade)) {
    throw new Error(`palette: unknown shade "${shade}"`);
  }
  return getPaletteRamp(palette)[shade];
}
