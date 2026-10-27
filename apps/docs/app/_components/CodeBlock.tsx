import * as React from 'react';

import { cn } from '@/lib/utils';

import {
  CodeBlock as NxdsCodeBlock,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockLine,
} from './nxds';

/**
 * Every docs code block — MDX fence, `CodeSample` and plain text alike —
 * renders through here, so the docs have one code-block surface, each with a
 * copy control.
 */
export function CodeBlock({
  framed = false,
  className,
  children,
  ...props
}: {
  /** Sits flush inside a bordered card instead of standing on its own. */
  framed?: boolean;
  /** Classes for the scroll region, such as a max height. */
  className?: string;
  /** One `CodeBlockLine` per line. */
  children: React.ReactNode;
  [dataAttribute: `data-${string}`]: string | undefined;
}) {
  return (
    <NxdsCodeBlock
      variant={framed ? 'flush' : 'default'}
      className={cn(!framed && 'nx:mb-4')}
      {...props}
    >
      <CodeBlockContent className={className}>{children}</CodeBlockContent>
      <CodeBlockCopyButton />
    </NxdsCodeBlock>
  );
}

type FenceLine = React.ReactElement<{ children?: React.ReactNode }>;

/**
 * The MDX `<pre>` override. rehype-pretty-code renders a fence as a `code`
 * of one `span` per line, with a newline between them; each span becomes a
 * `CodeBlockLine`.
 */
export function MdxCodeBlock({
  children,
  'data-language': language,
}: React.ComponentProps<'pre'> & { 'data-language'?: string }) {
  const code = React.isValidElement<{ children?: React.ReactNode }>(children)
    ? children.props.children
    : children;
  const lines = React.Children.toArray(code).filter((line): line is FenceLine =>
    React.isValidElement(line)
  );

  return (
    <CodeBlock data-language={language}>
      {lines.map((line, index) => (
        <CodeBlockLine key={index}>{line.props.children}</CodeBlockLine>
      ))}
    </CodeBlock>
  );
}
