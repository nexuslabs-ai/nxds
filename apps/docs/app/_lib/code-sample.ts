import { codeBlockTheme } from '@nxds/react/code-block-theme';
import bash from '@shikijs/langs/bash';
import css from '@shikijs/langs/css';
import tsx from '@shikijs/langs/tsx';
import vue from '@shikijs/langs/vue';
import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import 'server-only';

const LANGS = { bash, css, tsx, vue };

// Shiki renders `text` unhighlighted without loading a grammar for it.
export type CodeSampleLanguage = keyof typeof LANGS | 'text';

let highlighter: Promise<HighlighterCore> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighterCore({
    themes: [codeBlockTheme],
    langs: Object.values(LANGS),
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/** Each line of `code` as Shiki tokens coloured by `codeBlockTheme`. */
export async function highlightSample(lang: CodeSampleLanguage, code: string) {
  return (await getHighlighter()).codeToTokens(code, {
    lang,
    theme: codeBlockTheme.name,
  }).tokens;
}
