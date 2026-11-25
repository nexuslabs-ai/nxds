import type { NxdsAppearanceState } from '@nxds/core';

import { nxdsTheme } from './nxds-theme';

export const defaultAppearance = {
  ...nxdsTheme,
} satisfies NxdsAppearanceState;
