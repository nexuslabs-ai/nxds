import { useSyncExternalStore } from 'react';

import { DEFAULT_ICON_LIBRARY, ICON_LIBRARY_OPTIONS } from '@nxds/core';

const ICON_LIBRARY_STORAGE_KEY = 'nxds-homepage-icon-library';

const listeners = new Set();
let current = null;

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function storedIconLibrary() {
  try {
    const stored = localStorage.getItem(ICON_LIBRARY_STORAGE_KEY);
    const option = ICON_LIBRARY_OPTIONS.find(({ value }) => value === stored);
    return option?.value ?? DEFAULT_ICON_LIBRARY;
  } catch {
    return DEFAULT_ICON_LIBRARY;
  }
}

function readIconLibrary() {
  current ??= storedIconLibrary();
  return current;
}

/** The icon library Nexus components draw their own icons with. */
export function useIconLibrary() {
  return useSyncExternalStore(subscribe, readIconLibrary);
}

/** Redraws every Nexus icon in `library`, and remembers the choice. */
export function setIconLibrary(library) {
  if (!ICON_LIBRARY_OPTIONS.some(({ value }) => value === library)) return;
  current = library;
  try {
    localStorage.setItem(ICON_LIBRARY_STORAGE_KEY, library);
  } catch {
    // Storage can be off; the choice still holds for this page.
  }
  for (const listener of listeners) listener();
}
