'use client';

import { type ReactNode, useSyncExternalStore } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './nxds';

type ReactVersion = '18' | '19';

const STORAGE_KEY = 'nxds-docs-react';
const DEFAULT_VERSION: ReactVersion = '19';

const listeners = new Set<() => void>();
let chosen: ReactVersion | null = null;

function subscribe(listener: () => void) {
  /** Picks up a choice made in another tab. */
  function onStorage(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;
    chosen = null;
    listener();
  }
  listeners.add(listener);
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function readVersion(): ReactVersion {
  if (chosen) return chosen;
  try {
    return localStorage.getItem(STORAGE_KEY) === '18' ? '18' : DEFAULT_VERSION;
  } catch {
    return DEFAULT_VERSION;
  }
}

/** Switches every React version tab, and remembers the choice for other pages. */
function setVersion(value: string) {
  if (value !== '18' && value !== '19') return;
  chosen = value;
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Storage can be off; the choice still holds for this page.
  }
  for (const listener of listeners) listener();
}

/** The same install steps for an app on React 19 and one on React 18. */
export function ReactVersionTabs({
  react19,
  react18,
}: {
  react19: ReactNode;
  react18: ReactNode;
}) {
  const version = useSyncExternalStore(
    subscribe,
    readVersion,
    () => DEFAULT_VERSION
  );

  return (
    <Tabs value={version} onValueChange={setVersion} className="nx:mt-4">
      <TabsList size="sm" aria-label="React version">
        <TabsTrigger value="19">React 19</TabsTrigger>
        <TabsTrigger value="18">React 18</TabsTrigger>
      </TabsList>
      <TabsContent value="19">{react19}</TabsContent>
      <TabsContent value="18">{react18}</TabsContent>
    </Tabs>
  );
}
