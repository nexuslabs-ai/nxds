'use client';

import { type CSSProperties, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/button/button';

import { SiteFooter } from '../_components/SiteFooter';
import { requirePage, requireSection } from '../_lib/manifest';
import { STORYBOOK_URL } from '../_lib/site';

import { ChapterToolbar } from './ChapterToolbar';
import { CoexistLanes, hostTabs } from './coexist/CoexistLanes';
import { Community } from './Community';
import { AppearanceActions } from './customize/AppearanceActions';
import { AppearanceControls } from './customize/AppearanceControls';
import { CustomizeCanvas } from './customize/CustomizeCanvas';
import { CoreChipChapter } from './frameworks/CoreChipChapter';
import { ShowcaseWall } from './gallery/ShowcaseWall';
import type { StoryCode } from './stories/story-code';
import { storyModes } from './stories/story-test-model';
import { StoryTestIterations } from './stories/StoryTestIterations';

const GET_STARTED_HREF = requireSection('getting-started').href;

const chapters = [
  {
    id: 'explore',
    title: 'Your design system starts here.',
    cta: 'View components',
    href: requireSection('components').href,
    tabs: ['Components', 'Dashboard', 'Mail', 'Chat', 'Finances', 'CRM'],
  },
  {
    id: 'customize',
    title: 'Customize every detail.',
    cta: 'Open Playground',
    href: '/playground',
    tabs: ['Theme', 'Colors', 'Typography', 'Spacing', 'Radius', 'More'],
  },
  {
    id: 'coexist',
    title: 'Your next component shouldn’t change the rest.',
    cta: 'Explore integrations',
    href: requirePage('integrations', 'overview').route,
    tabs: hostTabs,
  },
  {
    id: 'frameworks',
    title: 'One foundation. Many frameworks.',
    cta: 'Explore the engine',
    href: requirePage('foundations', 'tokens').route,
    tabs: ['React', 'Vue', 'Svelte', 'Angular', 'React Native'],
  },
  {
    id: 'stories',
    title: 'Stories are the tests.',
    cta: 'Open Storybook',
    href: STORYBOOK_URL,
    tabs: storyModes.map(({ label }) => label),
  },
] as const;

/** Every chapter but Stories, which lays out its own stage. */
type ToolbarChapter = Exclude<(typeof chapters)[number], { id: 'stories' }>;

/** The selected tool. `index` is already clamped to `tools`. */
function toolAt<T>(tools: readonly [T, ...T[]], index: number): T {
  return tools[index] ?? tools[0];
}

function ChapterCanvas({
  chapter,
  selected,
  onSelect,
}: {
  chapter: ToolbarChapter;
  selected: number;
  onSelect: (index: number) => void;
}) {
  switch (chapter.id) {
    case 'explore':
      return <ShowcaseWall view={toolAt(chapter.tabs, selected)} />;
    case 'customize':
      return <CustomizeCanvas />;
    case 'coexist':
      return <CoexistLanes tab={chapter.tabs[selected]} />;
    case 'frameworks':
      return (
        <CoreChipChapter
          framework={toolAt(chapter.tabs, selected)}
          onSelect={onSelect}
        />
      );
  }
}

/**
 * One sticky stage that scrolls through the chapters: the scroll position
 * picks the chapter, and each chapter keeps its own selected tool.
 */
export function ChapterJourney({ storyCode }: { storyCode: StoryCode }) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState(0);
  const [selected, setSelected] = useState(() => chapters.map(() => 0));

  useEffect(() => {
    const trackElement = track.current;
    const stageElement = stage.current;
    if (!trackElement || !stageElement) return;

    let frame = 0;
    function measure() {
      if (!trackElement || !stageElement) return;
      frame = 0;
      const inset = parseFloat(getComputedStyle(stageElement).top) || 0;
      const distance = trackElement.offsetHeight - stageElement.offsetHeight;
      const progress =
        (inset - trackElement.getBoundingClientRect().top) /
        Math.max(1, distance);
      setChapter(
        Math.min(
          chapters.length,
          Math.max(0, Math.floor(progress * (chapters.length + 1)))
        )
      );
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(schedule);
    observer.observe(trackElement);
    observer.observe(stageElement);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  function selectTab(index: number) {
    setSelected((current) =>
      current.map((value, i) => (i === chapter ? index : value))
    );
  }

  // Past the last chapter, the stage shows the footer.
  const current = chapters[chapter];
  const trackStyle: CSSProperties & Record<'--story-chapter-count', number> = {
    '--story-chapter-count': chapters.length + 1,
  };

  return (
    <section
      className="nx:chapter-track"
      ref={track}
      aria-label="Design system walkthrough"
      style={trackStyle}
    >
      <div className="nx:chapter-stage" data-footer={!current} ref={stage}>
        {!current ? (
          <>
            <Community />
            <SiteFooter className="nx:story-chapter-content" />
          </>
        ) : current.id === 'stories' ? (
          <StoryTestIterations
            cta={current.cta}
            href={current.href}
            storyCode={storyCode}
          />
        ) : (
          <Chapter
            key={chapter}
            index={chapter}
            chapter={current}
            selected={Math.min(selected[chapter] ?? 0, current.tabs.length - 1)}
            onSelect={selectTab}
          />
        )}
      </div>
    </section>
  );
}

function Chapter({
  index,
  chapter,
  selected,
  onSelect,
}: {
  index: number;
  chapter: ToolbarChapter;
  selected: number;
  onSelect: (index: number) => void;
}) {
  const customize = chapter.id === 'customize';
  const controls =
    chapter.id === 'customize' ? (
      <AppearanceControls tool={toolAt(chapter.tabs, selected)} />
    ) : undefined;
  return (
    <>
      <div className="nx:chapter-heading">
        <h1>{chapter.title}</h1>
        {customize && (
          <p className="nx:customize-subtitle">
            Change one setting. See your system respond.
          </p>
        )}
        {chapter.id === 'coexist' && (
          <p className="nx:coexist-subtitle nx:typography-body-default">
            Nexus components bring their own styles, so you can add what you
            need while keeping the look and feel you’ve already built.
          </p>
        )}
        <div className="nx:story-ctas">
          <Button asChild>
            <Link href={GET_STARTED_HREF}>Get started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={chapter.href}>{chapter.cta}</Link>
          </Button>
        </div>
      </div>
      <div
        className="nx:story-canvas"
        role="region"
        id="story-panel"
        aria-labelledby={`story-tab-${index}-${selected}`}
      >
        <ChapterCanvas
          chapter={chapter}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
      <div className="nx:story-toolbar-position">
        <ChapterToolbar
          chapter={index}
          title={chapter.title}
          tabs={chapter.tabs}
          selected={selected}
          onSelect={onSelect}
          actions={customize ? <AppearanceActions /> : undefined}
          toolsAbove={customize ? 'sm' : undefined}
        >
          {controls}
        </ChapterToolbar>
      </div>
    </>
  );
}
