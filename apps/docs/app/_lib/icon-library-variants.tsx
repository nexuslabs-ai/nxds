import type { ReactNode } from 'react';

import { ICON_LIBRARY_OPTIONS, type NxdsIconLibrary } from '@nxds/core';

import { ForIconLibrary } from '../_components/ForIconLibrary';

type ByIconLibrary<T> = Readonly<Record<NxdsIconLibrary, T>>;

/** `value` of each icon library, by library. */
function mapIconLibraries<T>(
  value: (library: NxdsIconLibrary) => T
): ByIconLibrary<T> {
  const entries = ICON_LIBRARY_OPTIONS.map(
    ({ value: library }) => [library, value(library)] as const
  );
  return Object.fromEntries(entries) as Record<NxdsIconLibrary, T>;
}

/**
 * `render` of each icon library's value, shown for the reader's library. Each
 * distinct value renders once, and when every library has the same value
 * there is nothing to switch.
 */
export function byIconLibrary<T>(
  values: ByIconLibrary<T>,
  render: (value: T) => ReactNode
): ReactNode {
  const rendered = new Map<string, ReactNode>();
  const variants = mapIconLibraries((library) => {
    const key = JSON.stringify(values[library]);
    if (!rendered.has(key)) rendered.set(key, render(values[library]));
    return rendered.get(key);
  });
  if (rendered.size === 1) return [...rendered.values()][0];
  return <ForIconLibrary variants={variants} />;
}

/** Each icon library's `packages`, less those `listed` already shows for it. */
export function withoutListed(
  packages: ByIconLibrary<readonly string[]>,
  listed: ByIconLibrary<readonly string[]>
): ByIconLibrary<readonly string[]> {
  return mapIconLibraries((library) =>
    packages[library].filter((spec) => !listed[library].includes(spec))
  );
}
