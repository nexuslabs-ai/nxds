'use client';

import { useEffect, useRef, useState } from 'react';

import type { NxdsIconLibrary } from '@nxds/core';

import type { OtherFramework } from '../_lib/framework-demos';
import { useIconLibrary } from '../_lib/icon-library';

import { useFramework } from './FrameworkTabs';

type FrameworkDemos = {
  mount: (element: Element, id: string) => Promise<() => void>;
  setIconLibrary: (library: NxdsIconLibrary) => void;
};

/** The compiled demos `scripts/bundle-{framework}-demos.ts` writes to public/. */
function bundle(framework: OtherFramework) {
  return {
    entry: `/${framework}-demos/entry.js`,
    styles: `/${framework}-demos/entry.css`,
  };
}

function loadDemoStyles(framework: OtherFramework) {
  const { styles } = bundle(framework);
  if (document.querySelector(`link[href="${styles}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = styles;
  document.head.append(link);
}

function loadDemos(framework: OtherFramework): Promise<FrameworkDemos> {
  // The bundle is a static file, not a module Next should resolve.
  return import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ bundle(framework)
      .entry
  );
}

/**
 * Mounts one docs demo as its own app. It mounts only while `framework` is the
 * reader's, so a React reader never downloads another framework. It remounts
 * when the reader picks another icon library, so the demo draws with it.
 */
export function FrameworkDemoStage({
  framework,
  id,
}: {
  framework: OtherFramework;
  id: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const reader = useFramework();
  const iconLibrary = useIconLibrary();
  const [failedId, setFailedId] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (reader !== framework || !stage) return;

    let unmount: (() => void) | undefined;
    let cancelled = false;
    loadDemoStyles(framework);
    void loadDemos(framework)
      .then(({ mount, setIconLibrary }) => {
        setIconLibrary(iconLibrary);
        return mount(stage, id);
      })
      .then(
        (dispose) => {
          if (cancelled) dispose();
          else unmount = dispose;
        },
        (error: unknown) => {
          console.error(`${framework} demo ${id} failed to load`, error);
          if (!cancelled) setFailedId(id);
        }
      );

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [reader, framework, id, iconLibrary]);

  if (failedId === id) {
    return (
      <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
        This preview didn&apos;t load. Reload the page to try again.
      </p>
    );
  }

  return (
    <div
      ref={stageRef}
      data-framework-demo={`${framework}:${id}`}
      className="nx:contents"
    />
  );
}
