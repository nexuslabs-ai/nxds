'use client';

import { useEffect, useRef, useState } from 'react';

import { useFramework } from './FrameworkTabs';

/** The compiled Vue demos, which `scripts/bundle-vue-demos.ts` writes to public/. */
const VUE_DEMOS_ENTRY = '/vue-demos/entry.js';

/** The CSS the demos import, such as vue-sonner's, which the bundle writes beside its entry. */
const VUE_DEMOS_STYLES = '/vue-demos/entry.css';

function loadVueDemoStyles() {
  if (document.querySelector(`link[href="${VUE_DEMOS_STYLES}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = VUE_DEMOS_STYLES;
  document.head.append(link);
}

type VueDemos = {
  mount: (element: Element, id: string) => Promise<() => void>;
};

/**
 * Mounts one Vue docs demo as its own Vue app. It mounts only while Vue is
 * the reader's framework, so a React reader never downloads Vue.
 */
export function VueDemoStage({ id }: { id: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const framework = useFramework();
  const [failedId, setFailedId] = useState<string | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (framework !== 'vue' || !stage) return;

    let unmount: (() => void) | undefined;
    let cancelled = false;
    loadVueDemoStyles();
    // The bundle is a static file, not a module Next should resolve.
    const demos: Promise<VueDemos> = import(
      /* webpackIgnore: true */ /* turbopackIgnore: true */ VUE_DEMOS_ENTRY
    );
    void demos
      .then(({ mount }) => mount(stage, id))
      .then(
        (dispose) => {
          if (cancelled) dispose();
          else unmount = dispose;
        },
        () => {
          if (!cancelled) setFailedId(id);
        }
      );

    return () => {
      cancelled = true;
      unmount?.();
    };
  }, [framework, id]);

  if (failedId === id) {
    return (
      <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
        This preview didn&apos;t load. Reload the page to try again.
      </p>
    );
  }

  return <div ref={stageRef} data-vue-demo={id} className="nx:contents" />;
}
