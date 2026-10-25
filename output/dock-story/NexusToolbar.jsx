import {
  Toolbar,
  ToolbarTool,
  ToolbarToolGroup,
  ToolbarToolPanel,
} from '@nexus-toolbar/toolbar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@nexus-toolbar/tooltip';

import { tabIcons } from './dock-icons';

export function NexusToolbar({
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  hasControls,
  children,
}) {
  return (
    <Toolbar variant="floating" aria-label={title}>
      <ToolbarToolGroup
        aria-label={`${title} tools`}
        value={tabs[selected]}
        onValueChange={(value) => onSelect(tabs.indexOf(value))}
      >
        {tabs.map((tab, index) => {
          const Icon = tabIcons[tab];
          return (
            <Tooltip key={tab}>
              <TooltipTrigger asChild>
                <span className="nx:inline-flex">
                  <ToolbarTool
                    value={tab}
                    size="icon-lg"
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
        {hasControls &&
          tabs.map((tab) => (
            <ToolbarToolPanel key={tab} value={tab} side="top">
              {children}
            </ToolbarToolPanel>
          ))}
      </ToolbarToolGroup>
    </Toolbar>
  );
}
