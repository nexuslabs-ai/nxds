/** The icon libraries nxds components can draw their own icons with. */
export const ICON_LIBRARY_OPTIONS = [
  { value: 'phosphor', label: 'Phosphor' },
  { value: 'lucide', label: 'Lucide' },
  { value: 'tabler', label: 'Tabler Icons' },
  { value: 'hugeicons', label: 'HugeIcons' },
  { value: 'remix', label: 'Remix Icon' },
] as const;

export type NxdsIconLibrary = (typeof ICON_LIBRARY_OPTIONS)[number]['value'];

export const DEFAULT_ICON_LIBRARY: NxdsIconLibrary = 'phosphor';
