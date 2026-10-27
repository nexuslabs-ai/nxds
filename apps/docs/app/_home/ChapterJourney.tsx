'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@nxds/react/utils';
import Link from 'next/link';

import { Button } from '@/components/button/button';

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

/** Every chapter but Stories, which lays out its own section. */
type ToolbarChapter = Exclude<(typeof chapters)[number], { id: 'stories' }>;

/** The selected tool. `index` is always one of `tools`' indexes. */
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
 * The chapters as sections of one scrolling page. Each chapter keeps its own
 * selected tool. Only the chapter on the screen's middle line, or the one
 * holding focus, shows its toolbar.
 */
export function ChapterJourney({ storyCode }: { storyCode: StoryCode }) {
  const journey = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>(chapters[0].id);
  const [selected, setSelected] = useState(() => chapters.map(() => 0));

  useEffect(() => {
    const root = journey.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-50% 0px -50% 0px' }
    );
    const sections = Array.from(root.children);
    for (const section of sections) observer.observe(section);

    function activateFocusedSection(event: FocusEvent) {
      const section = sections.find((child) =>
        child.contains(event.target as Node)
      );
      if (section) setActive(section.id);
    }
    root.addEventListener('focusin', activateFocusedSection);
    return () => {
      observer.disconnect();
      root.removeEventListener('focusin', activateFocusedSection);
    };
  }, []);

  function selectTool(chapter: number, tool: number) {
    setSelected((current) =>
      current.map((value, i) => (i === chapter ? tool : value))
    );
  }

  return (
    <div className="nx:home-journey" ref={journey}>
      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          id={chapter.id}
          aria-labelledby={`${chapter.id}-title`}
          className="nx:site-column nx:home-section"
        >
          {chapter.id === 'stories' ? (
            <StoryTestIterations
              cta={chapter.cta}
              href={chapter.href}
              storyCode={storyCode}
              active={active === chapter.id}
            />
          ) : (
            <Chapter
              index={index}
              chapter={chapter}
              selected={selected[index] ?? 0}
              onSelect={(tool) => selectTool(index, tool)}
              active={active === chapter.id}
            />
          )}
        </section>
      ))}
      <Community />
    </div>
  );
}

function Chapter({
  index,
  chapter,
  selected,
  onSelect,
  active,
}: {
  index: number;
  chapter: ToolbarChapter;
  selected: number;
  onSelect: (index: number) => void;
  active: boolean;
}) {
  const Title = index === 0 ? 'h1' : 'h2';
  const customize = chapter.id === 'customize';
  const controls =
    chapter.id === 'customize' ? (
      <AppearanceControls tool={toolAt(chapter.tabs, selected)} />
    ) : undefined;
  return (
    <>
      <div className="nx:chapter-heading">
        <Title id={`${chapter.id}-title`}>{chapter.title}</Title>
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
        className={cn(
          'nx:story-canvas',
          chapter.id === 'coexist' && 'nx:story-canvas-grows'
        )}
        role="region"
        aria-labelledby={`story-tab-${index}-${selected}`}
      >
        <ChapterCanvas
          chapter={chapter}
          selected={selected}
          onSelect={onSelect}
        />
      </div>
      <ChapterToolbar
        chapter={index}
        title={chapter.title}
        tabs={chapter.tabs}
        selected={selected}
        onSelect={onSelect}
        active={active}
        actions={customize ? <AppearanceActions /> : undefined}
        toolsAbove={customize ? 'sm' : undefined}
      >
        {controls}
      </ChapterToolbar>
    </>
  );
}
