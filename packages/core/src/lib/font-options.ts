export type NxdsFontCategory = 'sans' | 'serif' | 'mono';

export interface NxdsFontOption {
  readonly value: string;
  readonly label: string;
  readonly category: NxdsFontCategory;
  /** The `font-family` stack the appearance prefs store. */
  readonly family: string;
  /** The Fontsource package that self-hosts the font. */
  readonly package: string;
}

const SANS_FALLBACK =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
const SERIF_FALLBACK = 'Georgia, serif';
const MONO_FALLBACK = 'ui-monospace, "SF Mono", Menlo, monospace';

/** The fonts nxds offers beside the system stacks, self-hosted through Fontsource. */
export const FONT_OPTIONS = [
  {
    value: 'geist',
    label: 'Geist',
    category: 'sans',
    family: `"Geist Variable", ${SANS_FALLBACK}`,
    package: '@fontsource-variable/geist',
  },
  {
    value: 'inter',
    label: 'Inter',
    category: 'sans',
    family: `"Inter Variable", ${SANS_FALLBACK}`,
    package: '@fontsource-variable/inter',
  },
  {
    value: 'figtree',
    label: 'Figtree',
    category: 'sans',
    family: `"Figtree Variable", ${SANS_FALLBACK}`,
    package: '@fontsource-variable/figtree',
  },
  {
    value: 'dm-sans',
    label: 'DM Sans',
    category: 'sans',
    family: `"DM Sans Variable", ${SANS_FALLBACK}`,
    package: '@fontsource-variable/dm-sans',
  },
  {
    value: 'manrope',
    label: 'Manrope',
    category: 'sans',
    family: `"Manrope Variable", ${SANS_FALLBACK}`,
    package: '@fontsource-variable/manrope',
  },
  {
    value: 'ibm-plex-sans',
    label: 'IBM Plex Sans',
    category: 'sans',
    family: `"IBM Plex Sans Variable", ${SANS_FALLBACK}`,
    package: '@fontsource-variable/ibm-plex-sans',
  },
  {
    value: 'lora',
    label: 'Lora',
    category: 'serif',
    family: `"Lora Variable", ${SERIF_FALLBACK}`,
    package: '@fontsource-variable/lora',
  },
  {
    value: 'playfair-display',
    label: 'Playfair Display',
    category: 'serif',
    family: `"Playfair Display Variable", ${SERIF_FALLBACK}`,
    package: '@fontsource-variable/playfair-display',
  },
  {
    value: 'geist-mono',
    label: 'Geist Mono',
    category: 'mono',
    family: `"Geist Mono Variable", ${MONO_FALLBACK}`,
    package: '@fontsource-variable/geist-mono',
  },
  {
    value: 'jetbrains-mono',
    label: 'JetBrains Mono',
    category: 'mono',
    family: `"JetBrains Mono Variable", ${MONO_FALLBACK}`,
    package: '@fontsource-variable/jetbrains-mono',
  },
] as const satisfies readonly NxdsFontOption[];

export type NxdsFont = (typeof FONT_OPTIONS)[number]['value'];

/** The catalogue font whose stack is `family`, if it is one. */
export function findFontOption(family: string): NxdsFontOption | undefined {
  return FONT_OPTIONS.find((option) => option.family === family);
}
