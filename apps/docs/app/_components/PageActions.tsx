'use client';

import * as React from 'react';

import {
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconX,
} from '../_lib/switchable-icons';

import {
  Button,
  ButtonGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './nxds';

const COPY_RESET_MS = 2000;

const COPY_ICONS = { idle: IconCopy, copied: IconCheck, failed: IconX };

const COPY_LABELS = { idle: 'Copy page', copied: 'Copied', failed: 'Failed' };

const COPY_MESSAGES = {
  idle: '',
  copied: 'Page copied as Markdown',
  failed: 'Could not copy page',
};

type CopyState = keyof typeof COPY_ICONS;

/**
 * Copies the page's Markdown twin, with a menu to open it. Clipboard writes
 * must happen in the click itself, so the Markdown is fetched ahead of it.
 */
export function PageActions({ markdownHref }: { markdownHref: string }) {
  const [markdown, setMarkdown] = React.useState<string>();
  // `seq` remounts the message, so a second copy announces again.
  const [copy, setCopy] = React.useState<{ state: CopyState; seq: number }>({
    state: 'idle',
    seq: 0,
  });
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    let ignore = false;
    fetch(markdownHref)
      .then((response) => (response.ok ? response.text() : undefined))
      .then((text) => {
        if (!ignore) setMarkdown(text);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [markdownHref]);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const settle = (state: Exclude<CopyState, 'idle'>) => {
    setCopy(({ seq }) => ({ state, seq: seq + 1 }));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setCopy(({ seq }) => ({ state: 'idle', seq })),
      COPY_RESET_MS
    );
  };

  const handleCopy = async () => {
    if (markdown === undefined) {
      settle('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      settle('copied');
    } catch {
      settle('failed');
    }
  };

  const Icon = COPY_ICONS[copy.state];

  return (
    <div data-md-skip>
      <ButtonGroup size="sm">
        <Button
          variant="outline"
          data-state={copy.state}
          startIcon={<Icon />}
          className="nx:data-[state=copied]:text-success-subtle-foreground nx:data-[state=failed]:text-error-subtle-foreground"
          onClick={handleCopy}
        >
          {COPY_LABELS[copy.state]}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm" aria-label="More actions">
              <IconChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={markdownHref}>Open as Markdown</a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <span role="status" className="nx:sr-only">
        <span key={copy.seq}>{COPY_MESSAGES[copy.state]}</span>
      </span>
    </div>
  );
}
