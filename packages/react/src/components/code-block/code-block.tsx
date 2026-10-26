import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { IconCheck, IconCopy, IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button/button';
import { ScrollArea, ScrollBar } from '../scroll-area/scroll-area';

import { codeBlockTheme } from './code-block-theme';

const codeBlockVariants = cva(
  'nx:group/code-block nx:relative nx:overflow-hidden nx:bg-container nx:text-foreground',
  {
    variants: {
      variant: {
        default:
          'nx:rounded-md nx:border-width-default nx:border-color-default',
        flush: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Props for CodeBlock. `variant` sets whether the block draws its own border.
 */
type CodeBlockProps = React.ComponentProps<'div'> &
  VariantProps<typeof codeBlockVariants>;

/**
 * Surface for a block of code. Put the code in `CodeBlockContent`, one
 * `CodeBlockLine` per line. Add `CodeBlockCopyButton` to let readers copy it.
 * Use the `flush` variant inside a `Card`, which draws the border.
 */
function CodeBlock({
  className,
  variant = 'default',
  ...props
}: CodeBlockProps) {
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      className={cn(codeBlockVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Props for CodeBlockContent, from ScrollArea. `type` sets when the
 * scrollbars show.
 */
type CodeBlockContentProps = React.ComponentProps<typeof ScrollArea>;

/**
 * Scrollable code region that holds the `CodeBlockLine` rows. It scrolls
 * sideways when a line is wider than the block. Add a `nx:max-h-*` class to
 * scroll long code up and down too.
 */
function CodeBlockContent({
  className,
  children,
  ...props
}: CodeBlockContentProps) {
  return (
    <ScrollArea
      data-slot="code-block-content"
      className={cn(
        // A max height set on this part caps the viewport, which scrolls.
        'nx:rounded-[inherit] nx:[&>[data-slot=scroll-area-viewport]]:max-h-[inherit]',
        // An inset ring, so the block's clipping or a card's can't hide it.
        'nx:[&>[data-slot=scroll-area-viewport]]:-outline-offset-2',
        className
      )}
      {...props}
    >
      <pre className="nx:m-0">
        <code className="nx:grid nx:grid-cols-[auto_minmax(0,1fr)] nx:py-4 nx:typography-code-block">
          {children}
        </code>
      </pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

/**
 * Props for CodeBlockLine.
 */
interface CodeBlockLineProps extends React.ComponentProps<'span'> {
  /** Line number to show in the gutter. Leave it out to show no number. */
  number?: number;
  /** Shades the line to draw the eye to it, such as the line a step runs. */
  highlighted?: boolean;
  /**
   * Colours the line's edge to mark a result. Give the result in text as
   * well, because some readers can't see the colour.
   */
  status?: 'success' | 'error';
}

/**
 * One line of code. Put the line's highlighted tokens or plain text inside.
 */
function CodeBlockLine({
  className,
  number,
  highlighted = false,
  status,
  children,
  ...props
}: CodeBlockLineProps) {
  return (
    <span
      data-slot="code-block-line"
      data-number={number}
      data-highlighted={highlighted || undefined}
      data-status={status}
      className={cn(
        'nx:col-span-full nx:grid nx:min-h-lh nx:grid-cols-subgrid nx:border-width-s-thick nx:border-transparent nx:px-4 nx:transition-colors nx:duration-fast',
        'nx:before:text-end nx:before:text-muted-foreground-subtle nx:before:content-[attr(data-number)] nx:data-number:before:me-4',
        'nx:data-highlighted:bg-container-hover nx:data-highlighted:before:text-muted-foreground nx:data-highlighted:not-data-status:border-foreground',
        'nx:data-[status=error]:border-error-subtle-foreground nx:data-[status=success]:border-success-subtle-foreground',
        'nx:group-has-data-[slot=code-block-copy-button]/code-block:pe-14',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {/* A grid doesn't render this newline, but the code's text keeps it. */}
      {'\n'}
    </span>
  );
}

const COPY_RESET_MS = 2000;

const COPY_ICONS = { idle: IconCopy, copied: IconCheck, failed: IconX };

const COPY_MESSAGES = {
  idle: '',
  copied: 'Code copied to clipboard',
  failed: 'Could not copy code',
};

type CopyState = keyof typeof COPY_MESSAGES;

// Each line ends in a newline. Drop the last, so a pasted command doesn't run.
function codeText(button: HTMLElement) {
  const code = button
    .closest('[data-slot="code-block"]')
    ?.querySelector('code');
  return code?.textContent?.replace(/\n$/, '') ?? '';
}

/**
 * Props for CodeBlockCopyButton. It takes the attributes of a button, except
 * `children` and `onClick`, which it sets itself.
 */
type CodeBlockCopyButtonProps = Omit<
  React.ComponentProps<'button'>,
  'children' | 'onClick'
>;

/**
 * Copies the code of the CodeBlock it sits in. It shows a check when the copy
 * works and a cross when it fails, and tells screen readers the result.
 */
function CodeBlockCopyButton({
  className,
  ...props
}: CodeBlockCopyButtonProps) {
  // `seq` remounts the message, so a second copy announces again.
  const [copy, setCopy] = React.useState<{ state: CopyState; seq: number }>({
    state: 'idle',
    seq: 0,
  });
  const timerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const settle = (state: Exclude<CopyState, 'idle'>) => {
    setCopy(({ seq }) => ({ state, seq: seq + 1 }));
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(
      () => setCopy(({ seq }) => ({ state: 'idle', seq })),
      COPY_RESET_MS
    );
  };

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const text = codeText(event.currentTarget);
    if (!text) {
      settle('failed');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      settle('copied');
    } catch {
      settle('failed');
    }
  };

  const Icon = COPY_ICONS[copy.state];

  return (
    <>
      <Button
        data-slot="code-block-copy-button"
        data-state={copy.state}
        variant="outline"
        size="icon-sm"
        aria-label="Copy code"
        className={cn(
          'nx:absolute nx:end-2 nx:top-2 nx:data-[state=copied]:text-success-subtle-foreground nx:data-[state=failed]:text-error-subtle-foreground',
          className
        )}
        {...props}
        onClick={handleClick}
      >
        <Icon />
      </Button>
      <span role="status" className="nx:sr-only">
        <span key={copy.seq}>{COPY_MESSAGES[copy.state]}</span>
      </span>
    </>
  );
}

export {
  CodeBlock,
  CodeBlockContent,
  type CodeBlockContentProps,
  CodeBlockCopyButton,
  type CodeBlockCopyButtonProps,
  CodeBlockLine,
  type CodeBlockLineProps,
  type CodeBlockProps,
  codeBlockTheme,
  codeBlockVariants,
};
