'use client';

import { useSyncExternalStore } from 'react';

// The homepage section on the screen's middle line, or the one holding focus.
// One observer serves every chapter toolbar.

const FIRST_SECTION = 'explore';

let active = FIRST_SECTION;
const listeners = new Set<() => void>();
let stopWatching: (() => void) | undefined;

function setActive(id: string) {
  if (id === active) return;
  active = id;
  for (const listener of listeners) listener();
}

function watchSections() {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );
  for (const section of document.querySelectorAll('[data-home-section]')) {
    observer.observe(section);
  }

  function activateFocusedSection(event: FocusEvent) {
    if (!(event.target instanceof Element)) return;
    const section = event.target.closest('[data-home-section]');
    if (section) setActive(section.id);
  }
  document.addEventListener('focusin', activateFocusedSection);

  return () => {
    observer.disconnect();
    document.removeEventListener('focusin', activateFocusedSection);
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  stopWatching ??= watchSections();
  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;
    stopWatching?.();
    stopWatching = undefined;
  };
}

/** Whether the homepage section `id` is the active one. */
export function useActiveSection(id: string): boolean {
  return useSyncExternalStore(
    subscribe,
    () => active === id,
    () => id === FIRST_SECTION
  );
}
