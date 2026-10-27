'use client';

import { type ReactNode, useSyncExternalStore } from 'react';

import { Show, type ShowProps } from '@/components/show/show';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTool,
  ToolbarToolGroup,
  ToolbarToolPanel,
} from '@/components/toolbar/toolbar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/tooltip/tooltip';

import { toolIcons, type ToolName } from './tool-icons';

// Six 48px tools plus the page's side padding need 378px, so narrower
// phones get the 40px tool size to keep the bar on one row.
const SMALL_PHONE = '(max-width: 377px)';

function subscribeToSmallPhone(onChange: () => void) {
  const query = window.matchMedia(SMALL_PHONE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useSmallPhone() {
  return useSyncExternalStore(
    subscribeToSmallPhone,
    () => window.matchMedia(SMALL_PHONE).matches,
    () => false
  );
}

/** The floating toolbar under each chapter: one tool per view of the canvas. */
export function ChapterToolbar({
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  actions,
  toolsAbove,
  children,
}: {
  chapter: number;
  title: string;
  tabs: readonly ToolName[];
  selected: number;
  onSelect: (index: number) => void;
  /** Buttons after the tools, behind a separator. */
  actions?: ReactNode;
  /** Hides the tools below this viewport width, leaving only `actions`. */
  toolsAbove?: ShowProps['above'];
  /** Panel content each tool opens above the bar. */
  children?: ReactNode;
}) {
  const smallPhone = useSmallPhone();
  const toolSize = smallPhone ? 'icon' : 'icon-lg';
  const tools = (
    <ToolbarToolGroup
      aria-label={`${title} tools`}
      value={tabs[selected]}
      onValueChange={(value) =>
        onSelect(tabs.findIndex((tab) => tab === value))
      }
    >
      {tabs.map((tab, index) => {
        const Icon = toolIcons[tab];
        return (
          <Tooltip key={tab}>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                <ToolbarTool
                  value={tab}
                  size={toolSize}
                  aria-label={tab}
                  id={`story-tab-${chapter}-${index}`}
                >
                  <Icon aria-hidden="true" />
                </ToolbarTool>
              </span>
            </TooltipTrigger>
            <TooltipContent>{tab}</TooltipContent>
          </Tooltip>
        );
      })}
      {children &&
        tabs.map((tab) => (
          <ToolbarToolPanel key={tab} value={tab} side="top">
            {children}
          </ToolbarToolPanel>
        ))}
    </ToolbarToolGroup>
  );
  if (!actions)
    return (
      <Toolbar variant="floating" aria-label={title}>
        {tools}
      </Toolbar>
    );
  const toolsAndSeparator = (
    <>
      {tools}
      <ToolbarSeparator />
    </>
  );
  return (
    <Toolbar variant="floating" aria-label={title}>
      {toolsAbove ? (
        <Show above={toolsAbove} as="div">
          {toolsAndSeparator}
        </Show>
      ) : (
        toolsAndSeparator
      )}
      <ToolbarGroup aria-label={`${title} actions`}>{actions}</ToolbarGroup>
    </Toolbar>
  );
}
