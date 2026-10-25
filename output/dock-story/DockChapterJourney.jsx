'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@nxds/react';
import { useNxdsAppearance } from '@nxds/react/appearance';
import { DialRoot, useDialKit } from 'dialkit';

import { initialPreviewAppearance } from './appearance-model';
import { CornerChoices, SurfaceToneChoices } from './AppearanceChoices';
import { AppearancePreview } from './AppearancePreview';
import { CoexistenceDiagram } from './CoexistenceDiagram';
import { ContextDock } from './ContextDock';
import { ContinuousDock } from './ContinuousDock';
import { CoreChipChapter } from './CoreChipChapter';
import { tabIcons } from './dock-icons';
import { FoundationChapter } from './FoundationChapter';
import { FrameworkChapter } from './FrameworkChapter';
import {
  ActiveLabelDock,
  MarkupPortraitDock,
  TactileDock,
} from './GrowingDock';
import { HeroAdoptionStudy } from './HeroAdoptionStudy';
import { MorphingDock } from './MorphingDock';
import { NexusAppearanceControls } from './NexusAppearanceControls';
import { NexusDock } from './NexusDock';
import { NexusPropertyControls } from './NexusPropertyControls';
import { NexusToolbar } from './NexusToolbar';
import { OriginalShowcaseGrid } from './original/ShowcaseGrid';
import { PlaceholderGrid } from './PlaceholderGrid';
import { PreviousNexusDock } from './PreviousNexusDock';
import { ShowcaseGrid } from './ShowcaseGrid';
import { brandLinkClassName, navLinkClassName } from './site-links';
import { StoriesChapter } from './StoriesChapter';
import { StoryReplayChapter } from './StoryReplayChapter';
import { StoryTestIterations } from './StoryTestIterations';
import { StraightDock } from './StraightDock';
import { WorkspaceThemeStudy } from './WorkspaceThemeStudy';

import 'dialkit/styles.css';
import './dock-chapter-journey.css';
import './story-chapters.css';

const chapters = [
  {
    id: 'explore',
    title: 'Your design system starts here.',
    cta: 'View components',
    href: 'https://nxds.dev/components/button',
    tabs: ['Components', 'Dashboard', 'Mail', 'Chat', 'Finances', 'CRM'],
  },
  {
    id: 'customize',
    controls: true,
    title: 'Customize every detail.',
    cta: 'Explore foundations',
    href: 'https://nxds.dev/foundations/tokens',
    tabs: ['Theme', 'Colors', 'Typography', 'Spacing', 'Radius', 'More'],
  },
  {
    id: 'coexist',
    title: 'Your next component shouldn’t change the rest.',
    subtitle:
      'Nexus components bring their own styles, so you can add what you need while keeping the look and feel you’ve already built.',
    cta: 'Explore integration',
    href: 'https://nxds.dev/getting-started/install',
    tabs: ['MUI', 'Ant Design', 'shadcn/ui'],
  },
  {
    id: 'frameworks',
    title: 'One foundation. Many frameworks.',
    cta: 'Explore the engine',
    href: 'https://nxds.dev/foundations/tokens',
    tabs: ['React', 'Vue', 'Svelte', 'Angular', 'React Native'],
  },
  {
    id: 'stories',
    title: 'Stories are the tests.',
    cta: 'Explore the stories',
    href: 'https://github.com/nexuslabs-ai/nxds/blob/main/packages/react/src/components/button/Button.stories.tsx',
    tabs: ['Click', 'Keyboard', 'Disabled'],
  },
];

function ChapterCanvas({
  chapter,
  tool,
  onFrameworkSelect,
  frameworkDiagram,
  showcaseView,
  showcaseVersion,
  appearance,
  customizeCanvas,
  coexistenceVersion,
}) {
  if (chapter === 'customize')
    return (
      <AppearancePreview
        appearance={appearance}
        view={
          customizeCanvas === 'board'
            ? 'Board'
            : customizeCanvas === 'labeled'
              ? 'LabeledBoard'
              : customizeCanvas === 'gallery'
                ? 'Gallery'
                : showcaseView
        }
      />
    );
  if (chapter === 'explore' && showcaseVersion === 'original')
    return <OriginalShowcaseGrid view={tool} />;
  if (chapter === 'explore') return <ShowcaseGrid view={tool} />;
  if (chapter === 'coexist' && coexistenceVersion === 'hero-adoption') {
    if (tool === 'HeroUI') return <HeroAdoptionStudy />;
    return (
      <WorkspaceThemeStudy
        stack={tool}
        onSelectMui={() => onFrameworkSelect(1)}
      />
    );
  }
  if (chapter === 'coexist' && coexistenceVersion === 'theme-match')
    return (
      <WorkspaceThemeStudy
        stack={tool}
        onSelectMui={() => onFrameworkSelect(0)}
      />
    );
  if (chapter === 'coexist' && coexistenceVersion === 'diagram')
    return <CoexistenceDiagram stack={tool} />;
  if (chapter === 'frameworks' && frameworkDiagram === 'chip')
    return <CoreChipChapter framework={tool} onSelect={onFrameworkSelect} />;
  if (chapter === 'frameworks' && frameworkDiagram === 'foundation')
    return <FoundationChapter framework={tool} onSelect={onFrameworkSelect} />;
  if (chapter === 'frameworks')
    return <FrameworkChapter framework={tool} onSelect={onFrameworkSelect} />;
  if (chapter === 'stories')
    return <StoriesChapter key={tool} scenario={tool} />;
  return <PlaceholderGrid />;
}

export function DockChapterJourney({
  previewAppearance,
  onPreviewAppearanceChange: updatePreviewAppearance,
  sharedAppearance,
}) {
  const track = useRef(null);
  const stage = useRef(null);
  const { state } = useNxdsAppearance();
  const dock = useDialKit(
    'Dock studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'nexus-toolbar', label: 'Nexus Toolbar · new' },
          { value: 'nexus-owned', label: 'Nexus owned dock · previous' },
          { value: 'nexus-dock', label: 'Nexus Dock · previous' },
          { value: 'straight-bare', label: 'Roomy · bare icons' },
          { value: 'straight-roomy', label: 'Straight expansion · roomy' },
          { value: 'straight', label: 'Straight expansion' },
          { value: 'continuous', label: 'Continuous surface' },
          { value: 'pill-morph', label: 'Pill morph · connected' },
          { value: 'markup-portrait', label: 'Markup · Portrait' },
          { value: 'tactile', label: 'Tactile tools' },
          { value: 'active-label', label: 'Active label · Examlly' },
          { value: 'contextual', label: 'Contextual dock' },
          { value: 'colored', label: 'Colored tiles · previous' },
        ],
        default: 'nexus-toolbar',
      },
      selectedWidth: {
        type: 'select',
        options: [
          { value: 'hug', label: 'Hug label · new' },
          { value: 'roomy', label: 'Roomy · previous' },
        ],
        default: 'hug',
      },
      showcase: {
        type: 'select',
        options: [
          { value: 'nexus', label: 'Nexus fields, rows & messages' },
          { value: 'original', label: 'Original · before migration' },
        ],
        default: 'nexus',
      },
      customize: {
        type: 'select',
        options: [
          { value: 'owned', label: 'Compact Nexus · reusable' },
          { value: 'compact', label: 'Compact Nexus · previous' },
          { value: 'visual', label: 'Visual choices · previous' },
          { value: 'nexus', label: 'Nexus appearance · previous' },
        ],
        default: 'owned',
      },
      showCustomize: { type: 'action', label: 'Show Customize chapter' },
      customizeCanvas: {
        type: 'select',
        options: [
          { value: 'board', label: 'Components & blocks · new' },
          { value: 'labeled', label: 'Labeled board · previous' },
          { value: 'gallery', label: 'Component gallery · previous' },
          { value: 'blocks', label: 'Blocks · previous' },
        ],
        default: 'board',
      },
      frameworkDiagram: {
        type: 'select',
        options: [
          { value: 'tokens', label: 'Token flow · previous' },
          { value: 'foundation', label: 'Shared foundation · new' },
          { value: 'chip', label: 'Core chip · new' },
        ],
        default: 'chip',
      },
      motion: { duration: [0.25, 0.1, 0.6, 0.05] },
      phone: {
        toolbar: {
          type: 'select',
          options: [
            { value: 'compact', label: '40px tools under 378px · new' },
            { value: 'large', label: 'Always 48px · previous' },
          ],
          default: 'compact',
        },
        gallery: {
          type: 'select',
          options: [
            { value: 'swipe', label: 'Swipe full cards · new' },
            { value: 'grid', label: '2 × 3 grid · previous' },
          ],
          default: 'swipe',
        },
      },
    },
    { id: 'nexus-story-dock-v2', persist: true, onAction: showCustomize }
  );
  const coexistence = useDialKit(
    'Coexistence studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'hero-adoption', label: 'HeroUI adoption · new' },
          { value: 'theme-match', label: 'Workspace theme study · previous' },
          { value: 'diagram', label: 'Coexistence diagram · previous' },
        ],
        default: 'hero-adoption',
      },
      showCoexistence: { type: 'action', label: 'Show incremental adoption' },
    },
    {
      id: 'nexus-story-coexistence-v1',
      persist: true,
      onAction: showCoexistence,
    }
  );
  const stories = useDialKit(
    'Stories studio',
    {
      iteration: {
        type: 'select',
        options: [
          { value: 'current', label: 'Button story · current' },
          { value: 'bento', label: 'Connected bento' },
          { value: 'split', label: 'Code and preview' },
          { value: 'regression', label: 'Catch a regression' },
          { value: 'walkthrough', label: 'Follow the story · new' },
        ],
        default: 'current',
      },
      showStories: { type: 'action', label: 'Show stories chapter' },
    },
    { id: 'nexus-story-examples-v1', persist: true, onAction: showStories }
  );

  function showCoexistence(action) {
    if (action !== 'showCoexistence') return;
    const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = track.current.offsetHeight - stage.current.offsetHeight;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top:
        top +
        distance *
          ((chapters.findIndex((item) => item.id === 'coexist') + 0.1) /
            (chapters.length + 1)),
      behavior: state.prefs.reduceMotion ? 'instant' : 'smooth',
    });
  }
  function showCustomize(action) {
    if (action !== 'showCustomize') return;
    const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = track.current.offsetHeight - stage.current.offsetHeight;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top: top + distance * (1.1 / (chapters.length + 1)),
      behavior: state.prefs.reduceMotion ? 'instant' : 'smooth',
    });
  }
  function showStories(action) {
    if (action !== 'showStories') return;
    const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
    const distance = track.current.offsetHeight - stage.current.offsetHeight;
    const top =
      window.scrollY + track.current.getBoundingClientRect().top - inset;
    window.scrollTo({
      top:
        top +
        distance *
          ((chapters.findIndex((item) => item.id === 'stories') + 0.1) /
            (chapters.length + 1)),
      behavior: state.prefs.reduceMotion ? 'instant' : 'smooth',
    });
  }

  const [chapter, setChapter] = useState(0);
  const [selected, setSelected] = useState(() => chapters.map(() => 0));

  useEffect(() => {
    let frame = 0;
    function measure() {
      frame = 0;
      const inset = parseFloat(getComputedStyle(stage.current).top) || 0;
      const distance = track.current.offsetHeight - stage.current.offsetHeight;
      const progress =
        (inset - track.current.getBoundingClientRect().top) /
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
    observer.observe(track.current);
    observer.observe(stage.current);
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

  function selectTab(index) {
    setSelected((current) =>
      current.map((value, i) => (i === chapter ? index : value))
    );
  }
  function navigateTabs(event) {
    const count = current.tabs.length;
    let next = activeIndex;
    if (event.key === 'ArrowRight') next = (next + 1) % count;
    else if (event.key === 'ArrowLeft') next = (next + count - 1) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    selectTab(next);
    event.currentTarget.querySelectorAll('[role="tab"]')[next].focus();
  }

  const current =
    chapters[chapter]?.id === 'coexist' &&
    coexistence.iteration === 'hero-adoption'
      ? {
          ...chapters[chapter],
          tabs: ['HeroUI', 'MUI'],
        }
      : chapters[chapter];
  const activeIndex = Math.min(
    selected[chapter] ?? 0,
    (current?.tabs.length ?? 1) - 1
  );
  const showFooter = chapter === chapters.length;
  const AppearanceControls =
    dock.customize === 'owned'
      ? NexusPropertyControls
      : NexusAppearanceControls;
  const DockComponent =
    dock.iteration === 'nexus-toolbar'
      ? NexusToolbar
      : dock.iteration === 'nexus-owned'
        ? NexusDock
        : PreviousNexusDock;
  const chapterControls =
    current?.id === 'customize' ? (
      <AppearanceControls
        compact={dock.customize === 'compact'}
        tool={current.tabs[activeIndex]}
        appearance={previewAppearance}
        onChange={updatePreviewAppearance}
        scopeDescription={
          sharedAppearance
            ? 'Updates the dock and showcase together.'
            : 'Applies to the component preview.'
        }
        onReset={() =>
          updatePreviewAppearance(initialPreviewAppearance(state.mode))
        }
        surfaceToneControl={
          ['visual', 'compact', 'owned'].includes(dock.customize) ? (
            <SurfaceToneChoices
              value={previewAppearance.surfaceTone}
              onChange={(surfaceTone) =>
                updatePreviewAppearance({ ...previewAppearance, surfaceTone })
              }
            />
          ) : undefined
        }
        cornersControl={
          ['visual', 'compact', 'owned'].includes(dock.customize) ? (
            <CornerChoices
              value={previewAppearance.corners}
              onChange={(corners) =>
                updatePreviewAppearance({ ...previewAppearance, corners })
              }
            />
          ) : undefined
        }
      />
    ) : null;
  return (
    <section
      className="dock-chapter-track"
      ref={track}
      data-reduce-motion={state.prefs.reduceMotion}
      aria-label="Design system walkthrough"
      data-dock-iteration={dock.iteration}
      data-phone-gallery={dock.phone.gallery}
      style={{ '--story-chapter-count': chapters.length + 1 }}
    >
      <div className="dock-chapter-stage" data-footer={showFooter} ref={stage}>
        {showFooter ? (
          <footer className="story-footer" key="footer">
            <Button
              asChild
              variant="link"
              size="sm"
              className={brandLinkClassName}
            >
              <a href="#top">Nexus Design System</a>
            </Button>
            <nav aria-label="Footer navigation">
              <Button
                asChild
                variant="link"
                size="sm"
                className={navLinkClassName}
              >
                <a href="https://nxds.dev/getting-started/introduction">
                  Documentation
                </a>
              </Button>
              <Button
                asChild
                variant="link"
                size="sm"
                className={navLinkClassName}
              >
                <a
                  href="https://github.com/nexuslabs-ai/nexus"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </Button>
            </nav>
          </footer>
        ) : current.id === 'stories' && stories.iteration === 'walkthrough' ? (
          <StoryReplayChapter
            dockIteration={dock.iteration}
            duration={dock.motion.duration}
            reduceMotion={state.prefs.reduceMotion}
            theme={state.mode}
          />
        ) : current.id === 'stories' && stories.iteration !== 'current' ? (
          <StoryTestIterations
            key={stories.iteration}
            iteration={stories.iteration}
            dockIteration={dock.iteration}
            duration={dock.motion.duration}
            reduceMotion={state.prefs.reduceMotion}
            theme={state.mode}
          />
        ) : (
          <>
            <div className="dock-chapter-heading" key={chapter}>
              <h1>{current.title}</h1>
              {current.id === 'customize' &&
                ['gallery', 'board', 'labeled'].includes(
                  dock.customizeCanvas
                ) && (
                  <p className="customize-gallery-subtitle">
                    Change one setting. See your system respond.
                  </p>
                )}
              {current.subtitle && (
                <p className="coexistence-story-subtitle nx:typography-body-default">
                  {current.subtitle}
                </p>
              )}
              <div className="story-ctas">
                <Button asChild>
                  <a href="https://nxds.dev/docs">Get started</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={current.href}>{current.cta}</a>
                </Button>
              </div>
            </div>
            <div
              className="story-canvas"
              role={dock.iteration === 'colored' ? 'tabpanel' : 'region'}
              id="story-panel"
              aria-labelledby={`story-tab-${chapter}-${activeIndex}`}
            >
              <ChapterCanvas
                chapter={current.id}
                tool={current.tabs[activeIndex]}
                onFrameworkSelect={selectTab}
                frameworkDiagram={dock.frameworkDiagram}
                showcaseView={chapters[0].tabs[selected[0]]}
                showcaseVersion={dock.showcase}
                appearance={previewAppearance}
                customizeCanvas={dock.customizeCanvas}
                coexistenceVersion={coexistence.iteration}
              />
            </div>
            <div className="story-dock-position">
              {['nexus-toolbar', 'nexus-owned', 'nexus-dock'].includes(
                dock.iteration
              ) ? (
                <DockComponent
                  compactOnSmallPhones={dock.phone.toolbar === 'compact'}
                  hugActive={dock.selectedWidth === 'hug'}
                  compactControls={['compact', 'owned'].includes(
                    dock.customize
                  )}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  hasControls={Boolean(current.controls)}
                >
                  {chapterControls}
                </DockComponent>
              ) : dock.iteration === 'straight-bare' ? (
                <StraightDock
                  className="roomy-dock bare-dock"
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </StraightDock>
              ) : dock.iteration === 'straight-roomy' ? (
                <StraightDock
                  className="roomy-dock"
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </StraightDock>
              ) : dock.iteration === 'straight' ? (
                <StraightDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </StraightDock>
              ) : dock.iteration === 'continuous' ? (
                <ContinuousDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </ContinuousDock>
              ) : dock.iteration === 'pill-morph' ? (
                <MorphingDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </MorphingDock>
              ) : dock.iteration === 'markup-portrait' ? (
                <MarkupPortraitDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </MarkupPortraitDock>
              ) : dock.iteration === 'tactile' ? (
                <TactileDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                >
                  {chapterControls}
                </TactileDock>
              ) : dock.iteration === 'active-label' ? (
                <ActiveLabelDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                  theme={state.mode}
                >
                  {chapterControls}
                </ActiveLabelDock>
              ) : dock.iteration === 'contextual' ? (
                <ContextDock
                  hasControls={Boolean(current.controls)}
                  key={chapter}
                  chapter={chapter}
                  title={current.title}
                  tabs={current.tabs}
                  selected={activeIndex}
                  onSelect={selectTab}
                  duration={dock.motion.duration}
                  reduceMotion={state.prefs.reduceMotion}
                >
                  {chapterControls}
                </ContextDock>
              ) : (
                <div
                  className="story-segmented"
                  role="tablist"
                  tabIndex={-1}
                  aria-label={current.title}
                  onKeyDown={navigateTabs}
                >
                  {current.tabs.map((tab, index) => {
                    const Icon = tabIcons[tab];
                    return (
                      <button
                        key={tab}
                        id={`story-tab-${chapter}-${index}`}
                        type="button"
                        role="tab"
                        aria-label={tab}
                        title={tab}
                        aria-selected={activeIndex === index}
                        aria-controls="story-panel"
                        tabIndex={activeIndex === index ? 0 : -1}
                        onClick={() => selectTab(index)}
                      >
                        <Icon size={21} stroke={1.7} aria-hidden="true" />
                        <span className="story-tab-label" aria-hidden="true">
                          {tab}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <DialRoot
        position="top-right"
        theme={state.mode}
        defaultOpen={false}
        productionEnabled
      />
    </section>
  );
}
