import type { NxdsIconLibrary } from '@nxds/core';
import type { Component } from 'vue';

import * as phosphor from '../icons';

import * as hugeicons from './hugeicons';
import * as lucide from './lucide';
import * as remix from './remix';
import * as tabler from './tabler';

export type IconName = keyof typeof phosphor;

/** Every library's internal icon set. Each one exports every `IconName`. */
export const ICON_SETS = {
  phosphor,
  lucide,
  tabler,
  hugeicons,
  remix,
} satisfies Record<NxdsIconLibrary, Record<IconName, Component>>;
