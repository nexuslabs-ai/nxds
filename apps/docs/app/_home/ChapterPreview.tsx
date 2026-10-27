'use client';

import { type ReactNode, useState } from 'react';

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

import { useActiveSection } from './active-section';
import { toolIcons, type ToolName } from './tool-icons';

/**
 * A chapter's preview: the canvas, and the floating toolbar whose tools pick
 * what the canvas shows. The bar sits at the bottom of the screen and shows
 * only while its chapter is the active section.
 */
export function ChapterPreview<T extends ToolName>({
  chapter,
  label,
  tools,
  selected,
  onSelect,
  grows = false,
  actions,
  toolsAbove,
  panel,
  children,
}: {
  /** The id of the section this preview sits in. */
  chapter: string;
  /** Names the toolbar and its tools. */
  label: string;
  tools: readonly T[];
  selected: T;
  onSelect: (tool: T) => void;
  /** Below `lg`, the canvas takes its content's height, not the screen's. */
  grows?: boolean;
  /** Buttons after the tools, behind a separator. */
  actions?: ReactNode;
  /** Hides the tools below this viewport width, leaving only `actions`. */
  toolsAbove?: ShowProps['above'];
  /** Controls each tool opens in a panel above the bar. */
  panel?: ReactNode;
  /** What the canvas shows. */
  children: ReactNode;
}) {
  const active = useActiveSection(chapter);
  const [open, setOpen] = useState(false);
  // A panel left open closes with its chapter, so coming back doesn't reopen
  // it and move focus into it.
  const [wasActive, setWasActive] = useState(active);
  if (active !== wasActive) {
    setWasActive(active);
    if (!active) setOpen(false);
  }

  const toolId = (index: number) => `${chapter}-tool-${index}`;
  function selectTool(value: string) {
    const tool = tools.find((item) => item === value);
    if (tool) onSelect(tool);
  }

  const toolGroup = (
    <ToolbarToolGroup
      aria-label={`${label} tools`}
      value={selected}
      onValueChange={selectTool}
      open={open}
      onOpenChange={setOpen}
    >
      {tools.map((tool, index) => {
        const name: ToolName = tool;
        const Icon = toolIcons[name];
        return (
          <Tooltip key={tool}>
            <TooltipTrigger asChild>
              <span className="nx:inline-flex">
                {/* Six 48px tools and the page's side margins need 378px. */}
                <ToolbarTool
                  value={tool}
                  size="icon-lg"
                  aria-label={tool}
                  id={toolId(index)}
                  className="nx:max-[23.625rem]:size-10"
                >
                  <Icon aria-hidden="true" />
                </ToolbarTool>
              </span>
            </TooltipTrigger>
            <TooltipContent>{tool}</TooltipContent>
          </Tooltip>
        );
      })}
      {panel &&
        tools.map((tool) => (
          <ToolbarToolPanel key={tool} value={tool} side="top">
            {panel}
          </ToolbarToolPanel>
        ))}
    </ToolbarToolGroup>
  );
  const toolsAndSeparator = (
    <>
      {toolGroup}
      <ToolbarSeparator />
    </>
  );
  const toolsAndActions = actions && (
    <>
      {toolsAbove ? (
        <Show above={toolsAbove} as="div">
          {toolsAndSeparator}
        </Show>
      ) : (
        toolsAndSeparator
      )}
      <ToolbarGroup aria-label={`${label} actions`}>{actions}</ToolbarGroup>
    </>
  );

  return (
    <>
      <div
        className="nx:chapter-canvas"
        data-grows={grows || undefined}
        role="region"
        aria-labelledby={toolId(tools.indexOf(selected))}
      >
        {children}
      </div>
      <div className="nx:chapter-toolbar" data-active={active}>
        <Toolbar variant="floating" aria-label={label}>
          {toolsAndActions ?? toolGroup}
        </Toolbar>
      </div>
    </>
  );
}
