// A theme with every export flag away from its default. The build checks it
// as a whole system, and the smoke test loads it on a canvas.
import type { ThemeFlags } from '../src/theme.ts';

export const FULL_THEME: ThemeFlags = {
  'brand-color': '#e11d48',
  'surface-tone': 'stone',
  'light-contrast': '70',
  'dark-contrast': '30',
  density: 'compact',
  corners: 'round',
  elevation: 'strong',
  stroke: 'strong',
  font: 'inter',
  'heading-font': 'playfair-display',
  'code-font': 'jetbrains-mono',
  'ui-scale': 'large',
  'text-size': '16',
  'code-font-size': '13',
};
