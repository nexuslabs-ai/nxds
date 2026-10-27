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
const CodeBlock = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CodeBlockProps>
>(function CodeBlock(propsWithoutRef, forwardedRef) {
  const {
    className,
    variant = 'default',
    ...props
  }: React.PropsWithoutRef<CodeBlockProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <div
      data-slot="code-block"
      data-variant={variant}
      className={cn(codeBlockVariants({ variant }), className)}
      {...props}
    />
  );
});

/**
 * Props for CodeBlockContent, from ScrollArea. `type` sets when the
 * scrollbars show.
 */
interface CodeBlockContentProps extends React.ComponentProps<
  typeof ScrollArea
> {
  /**
   * Language of the code, such as `tsx`. It sets the `language-*` class on
   * `code`, which Markdown converters and reader tools read.
   */
  language?: string;
}

/**
 * Scrollable code region that holds the `CodeBlockLine` rows. It scrolls
 * sideways when a line is wider than the block. Add a `nx:max-h-*` class to
 * scroll long code up and down too.
 */
const CodeBlockContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithoutRef<CodeBlockContentProps>
>(function CodeBlockContent(propsWithoutRef, forwardedRef) {
  const {
    className,
    language,
    children,
    ...props
  }: React.PropsWithoutRef<CodeBlockContentProps> & {
    ref?: React.ForwardedRef<HTMLDivElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
        <code
          className={cn(
            'nx:grid nx:grid-cols-[auto_auto_minmax(0,1fr)] nx:py-4 nx:typography-code-block',
            language && `language-${language}`
          )}
        >
          {children}
        </code>
      </pre>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
});

const codeBlockDiffClasses =
  "nx:data-diff:after:col-start-2 nx:data-diff:after:row-start-1 nx:data-diff:after:me-2 nx:data-[diff=added]:bg-success-subtle nx:data-[diff=added]:after:text-success-subtle-foreground nx:data-[diff=added]:after:content-['+'] nx:data-[diff=removed]:bg-error-subtle nx:data-[diff=removed]:after:text-error-subtle-foreground nx:data-[diff=removed]:after:content-['−']";

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
  /**
   * Marks the line as added or removed in a diff. The line gets a green or
   * red tint and a `+` or `−` before the code. The copy button leaves out
   * removed lines.
   */
  diff?: 'added' | 'removed';
}

/**
 * One line of code. Put the line's highlighted tokens or plain text inside.
 */
const CodeBlockLine = React.forwardRef<
  HTMLSpanElement,
  React.PropsWithoutRef<CodeBlockLineProps>
>(function CodeBlockLine(propsWithoutRef, forwardedRef) {
  const {
    className,
    number,
    highlighted = false,
    status,
    diff,
    children,
    ...props
  }: React.PropsWithoutRef<CodeBlockLineProps> & {
    ref?: React.ForwardedRef<HTMLSpanElement>;
  } = forwardedRef === null
    ? propsWithoutRef
    : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <span
      data-slot="code-block-line"
      data-number={number}
      data-highlighted={highlighted || undefined}
      data-status={status}
      data-diff={diff}
      className={cn(
        'nx:col-span-full nx:grid nx:min-h-lh nx:grid-cols-subgrid nx:border-width-s-thick nx:border-transparent nx:px-4 nx:transition-colors nx:duration-fast',
        'nx:before:text-end nx:before:text-muted-foreground-subtle nx:before:content-[attr(data-number)] nx:data-number:before:me-4',
        'nx:data-highlighted:not-data-diff:bg-container-hover nx:data-highlighted:before:text-muted-foreground nx:data-highlighted:not-data-status:border-foreground',
        'nx:data-[status=error]:border-error-subtle-foreground nx:data-[status=success]:border-success-subtle-foreground',
        codeBlockDiffClasses,
        'nx:group-has-data-[slot=code-block-copy-button]/code-block:pe-14',
        className
      )}
      {...props}
    >
      <span className="nx:col-start-3">{children}</span>
      {/* A grid doesn't render this newline, but the code's text keeps it. */}
      {'\n'}
    </span>
  );
});

const COPY_RESET_MS = 2000;

const COPY_ICONS = { idle: IconCopy, copied: IconCheck, failed: IconX };

const COPY_MESSAGES = {
  idle: '',
  copied: 'Code copied to clipboard',
  failed: 'Could not copy code',
};

type CopyState = keyof typeof COPY_MESSAGES;

// Each line ends in a newline. Removed diff lines stay out, and so does the
// last newline, so a pasted command doesn't run.
function codeText(button: HTMLElement) {
  const lines = button
    .closest('[data-slot="code-block"]')
    ?.querySelectorAll(
      '[data-slot="code-block-content"] [data-slot="code-block-line"]:not([data-diff="removed"])'
    );
  return Array.from(lines ?? [], (line) => line.textContent)
    .join('')
    .replace(/\n$/, '');
}

/**
 * Props for CodeBlockCopyButton. It takes the attributes of a button, except
 * `children`, which it sets itself. `onClick` runs before the copy.
 */
type CodeBlockCopyButtonProps = Omit<
  React.ComponentProps<'button'>,
  'children'
>;

/**
 * Copies the code of the CodeBlock it sits in. It shows a check when the copy
 * works and a cross when it fails, and tells screen readers the result.
 */
const CodeBlockCopyButton = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<CodeBlockCopyButtonProps>
>(function CodeBlockCopyButton(propsWithoutRef, forwardedRef) {
  const {
    className,
    onClick,
    ...props
  }: React.PropsWithoutRef<CodeBlockCopyButtonProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
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
    onClick?.(event);
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
});

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
