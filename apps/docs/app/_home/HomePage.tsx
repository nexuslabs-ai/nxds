'use client';

import { useEffect, useRef } from 'react';

import { useNxdsAppearance } from '@nxds/react/appearance';

import { ChapterJourney } from './ChapterJourney';
import { SiteHeader } from './SiteHeader';
import type { StoryCode } from './stories/story-code';

/** The nxds.dev homepage: the site header over the chapter walkthrough. */
export function HomePage({ storyCode }: { storyCode: StoryCode }) {
  const header = useRef<HTMLElement>(null);
  const { resolvedMode, setState } = useNxdsAppearance();

  // The sticky stage and the toolbar panels size themselves below the header.
  useEffect(() => {
    const element = header.current;
    if (!element) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(
        '--story-header-height',
        `${element.getBoundingClientRect().height}px`
      );
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--story-header-height');
    };
  }, []);

  function toggleTheme() {
    setState((current) => ({
      ...current,
      mode: resolvedMode === 'light' ? 'dark' : 'light',
    }));
  }

  return (
    <>
      <SiteHeader
        ref={header}
        mode={resolvedMode}
        onThemeToggle={toggleTheme}
      />
      <main id="top">
        <ChapterJourney storyCode={storyCode} />
      </main>
    </>
  );
}
