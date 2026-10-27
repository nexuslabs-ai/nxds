import { highlightSample } from '../../_lib/code-sample';

import { describeStory, storyModes } from './story-test-model';

import 'server-only';

type StoryCodeToken = { content: string; color?: string };

/** Each story's source as highlighted lines of tokens, by story name. */
export type StoryCode = Record<string, StoryCodeToken[][]>;

/**
 * Highlights every story the Stories chapter can show, at build time, so the
 * highlighter stays out of the client bundle.
 */
export async function highlightStories(): Promise<StoryCode> {
  const sources = new Map<string, string>();
  for (const mode of storyModes)
    for (const { value } of mode.options) {
      const { name, source } = describeStory(mode.id, value);
      const code = source.join('\n');
      const known = sources.get(name);
      if (known !== undefined && known !== code)
        throw new Error(`Two different stories are named ${name}.`);
      sources.set(name, code);
    }

  const stories = await Promise.all(
    Array.from(sources, async ([name, code]) => {
      const lines = await highlightSample('tsx', code);
      return [
        name,
        lines.map((tokens) =>
          tokens.map(({ content, color }) => ({ content, color }))
        ),
      ] as const;
    })
  );
  return Object.fromEntries(stories);
}
