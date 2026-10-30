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

const COPY_STATES = {
  idle: { icon: IconCopy, label: 'Copy page', message: '' },
  copied: {
    icon: IconCheck,
    label: 'Copied',
    message: 'Page copied as Markdown',
  },
  failed: { icon: IconX, label: 'Failed', message: 'Could not copy page' },
};

type CopyState = keyof typeof COPY_STATES;

type Fetched =
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'error' };

/**
 * Copies the page's Markdown twin, with a menu to open it. Clipboard writes
 * must happen in the click itself, so the Markdown is fetched ahead of it.
 */
export function PageActions({ markdownHref }: { markdownHref: string }) {
  const [markdown, setMarkdown] = React.useState<Fetched>({
    status: 'loading',
  });
  // `seq` remounts the message, so a second copy announces again.
  const [copy, setCopy] = React.useState<{ state: CopyState; seq: number }>({
    state: 'idle',
    seq: 0,
  });
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    let ignore = false;
    fetch(markdownHref)
      .then((response) => {
        if (!response.ok) throw new Error(`${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (!ignore) setMarkdown({ status: 'ready', text });
      })
      .catch(() => {
        if (!ignore) setMarkdown({ status: 'error' });
      });
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
    if (markdown.status === 'loading') return;
    if (markdown.status === 'error') {
      settle('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown.text);
      settle('copied');
    } catch {
      settle('failed');
    }
  };

  const { icon: Icon, label, message } = COPY_STATES[copy.state];

  return (
    <div data-md-skip>
      <ButtonGroup size="sm">
        <Button
          variant="outline"
          data-state={copy.state}
          aria-disabled={markdown.status === 'loading' || undefined}
          startIcon={<Icon />}
          className="nx:data-[state=copied]:text-success-subtle-foreground nx:data-[state=failed]:text-error-subtle-foreground"
          onClick={handleCopy}
        >
          {label}
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
        <span key={copy.seq}>{message}</span>
      </span>
    </div>
  );
}
