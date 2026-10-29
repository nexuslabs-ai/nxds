import type { ComponentPropsWithoutRef, JSXElementConstructor } from 'react';

import type { NxdsIconLibrary } from '@nxds/core';

import * as phosphor from '../icons';

import * as hugeicons from './hugeicons';
import * as lucide from './lucide';
import * as remix from './remix';
import * as tabler from './tabler';

export type IconName = keyof typeof phosphor;

/** What a component may pass an internal icon. */
export type IconProps = Omit<ComponentPropsWithoutRef<'svg'>, 'children'>;

/** Every library's internal icon set. Each one exports every `IconName`. */
export const ICON_SETS = {
  phosphor,
  lucide,
  tabler,
  hugeicons,
  remix,
} satisfies Record<
  NxdsIconLibrary,
  Record<IconName, JSXElementConstructor<IconProps>>
>;
