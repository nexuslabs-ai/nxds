// nxds-cli writes this file from the theme in nxds.json, so edits here are
// lost. Change the theme with `npx nxds-cli@latest init` flags, such as
// `--density compact`, or override it in appearance-state.ts.
import {
  DEFAULT_NXDS_APPEARANCE,
  type NxdsAppearanceState,
} from '@nxds/core';

export const nxdsTheme = {
  ...DEFAULT_NXDS_APPEARANCE,
  prefs: {
    ...DEFAULT_NXDS_APPEARANCE.prefs,
    uiFont: '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
} satisfies NxdsAppearanceState;
