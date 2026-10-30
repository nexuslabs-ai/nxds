'use client';

import type { ReactNode } from 'react';

import type { NxdsIconLibrary } from '@nxds/core';

import { useIconLibrary } from '../_lib/icon-library';

/** Shows the variant for the icon library the reader picked. */
export function ForIconLibrary({
  variants,
}: {
  variants: Readonly<Record<NxdsIconLibrary, ReactNode>>;
}) {
  return variants[useIconLibrary()];
}
