// The types of nxds:icon-names: each icon component bundle.js ships, by its
// canvas name.
import type { ComponentType } from 'react';

export declare const ICON_COMPONENTS: Record<
  string,
  ComponentType<Record<string, unknown>> | undefined
>;
