import { useSyncExternalStore } from 'react';

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

// Six 48px tools plus the page's side padding need 378px, so narrower
// phones get the 40px tool size to keep the bar on one row.
const SMALL_PHONE = '(max-width: 377px)';

function subscribeToSmallPhone(onChange) {
  const query = window.matchMedia(SMALL_PHONE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useSmallPhone() {
  return useSyncExternalStore(
    subscribeToSmallPhone,
    () => window.matchMedia(SMALL_PHONE).matches
  );
}

export function NexusToolbar({
  chapter,
  title,
  tabs,
  selected,
  onSelect,
  hasControls,
  compactOnSmallPhones = false,
  children,
}) {
  const smallPhone = useSmallPhone();
  const toolSize = compactOnSmallPhones && smallPhone ? 'icon' : 'icon-lg';
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
