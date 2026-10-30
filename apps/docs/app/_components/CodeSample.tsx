import type { ComponentProps } from 'react';

import type { NxdsIconLibrary } from '@nxds/core';

import { type CodeSampleLanguage, highlightSample } from '../_lib/code-sample';
import { byIconLibrary } from '../_lib/icon-library-variants';

import { DocsCodeBlock } from './CodeBlock';
import { CodeCard } from './CodeCard';
import { CodeBlockLine } from './nxds';

/**
 * A code string rendered outside an MDX fence. Tokenised by the same theme the
 * MDX fences use, then rendered in the same `DocsCodeBlock` those fences render
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
    <DocsCodeBlock framed={framed} language={lang}>
      {lines.map((tokens, index) => (
        <CodeBlockLine key={index}>
          {tokens.map((token, at) => (
            <span key={at} style={{ color: token.color }}>
              {token.content}
            </span>
          ))}
        </CodeBlockLine>
      ))}
    </DocsCodeBlock>
  );
}

/**
 * A docs example's code attached beneath `header` in a `CodeCard`, as the
 * reader's icon library draws it.
 */
export function ExampleCodeCard({
  lang,
  sources,
  ...props
}: Omit<ComponentProps<typeof CodeCard>, 'lines' | 'children'> & {
  lang: CodeSampleLanguage;
  sources: Readonly<Record<NxdsIconLibrary, string>>;
}) {
  const lines = Math.max(
    ...Object.values(sources).map((code) => code.trimEnd().split('\n').length)
  );

  return (
    <CodeCard lines={lines} {...props}>
      {byIconLibrary(sources, (code) => (
        <CodeSample lang={lang} framed>
          {code}
        </CodeSample>
      ))}
    </CodeCard>
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
