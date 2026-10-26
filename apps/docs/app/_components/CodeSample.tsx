import type { ComponentProps } from 'react';

import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';

import { CodeBlock } from './CodeBlock';
import { CodeCard } from './CodeCard';
import { CodeBlockLine } from './nxds';

/**
 * A code string rendered outside an MDX fence. Tokenised by the same theme the
 * MDX fences use, then rendered in the same `CodeBlock` those fences render
 * through, so a sample and a fence get the same surface and copy control.
 */
export async function CodeSample({
  lang,
  framed,
  children,
}: {
  lang: CodeSampleLanguage;
  framed?: boolean;
  children: string;
}) {
  const lines = await highlightSample(lang, children.trimEnd());

  return (
    <CodeBlock framed={framed} data-language={lang}>
      {lines.map((tokens, index) => (
        <CodeBlockLine key={index}>
          {tokens.map((token, at) => (
            <span key={at} style={{ color: token.color }}>
              {token.content}
            </span>
          ))}
        </CodeBlockLine>
      ))}
    </CodeBlock>
  );
}

/** A `CodeSample` attached beneath `header` in a `CodeCard`. */
export function CodeSampleCard({
  lang,
  code,
  ...props
}: Omit<ComponentProps<typeof CodeCard>, 'lines' | 'children'> & {
  lang: CodeSampleLanguage;
  code: string;
}) {
  return (
    <CodeCard lines={code.trimEnd().split('\n').length} {...props}>
      <CodeSample lang={lang} framed>
        {code}
      </CodeSample>
    </CodeCard>
  );
}
