'use client';

import { useSyncExternalStore } from 'react';

import {
  DEFAULT_ICON_LIBRARY,
  ICON_LIBRARY_OPTIONS,
  type NxdsIconLibrary,
} from '@nxds/core';

const ICON_LIBRARY_STORAGE_KEY = 'nxds-docs-icon-library';

const listeners = new Set<() => void>();
let current: NxdsIconLibrary | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function storedIconLibrary(): NxdsIconLibrary {
  try {
    const stored = localStorage.getItem(ICON_LIBRARY_STORAGE_KEY);
    const option = ICON_LIBRARY_OPTIONS.find(({ value }) => value === stored);
    return option?.value ?? DEFAULT_ICON_LIBRARY;
  } catch {
    return DEFAULT_ICON_LIBRARY;
  }
}

function readIconLibrary(): NxdsIconLibrary {
  current ??= storedIconLibrary();
  return current;
}

/** The icon library the docs examples draw nxds's own icons with. */
export function useIconLibrary(): NxdsIconLibrary {
  return useSyncExternalStore(
    subscribe,
    readIconLibrary,
    () => DEFAULT_ICON_LIBRARY
  );
}

/** Redraws every example's icons in `library`, and remembers the choice. */
export function setIconLibrary(library: NxdsIconLibrary) {
  current = library;
  try {
    localStorage.setItem(ICON_LIBRARY_STORAGE_KEY, library);
  } catch {
    // Storage can be off; the choice still holds for this page.
  }
  for (const listener of listeners) listener();
}
