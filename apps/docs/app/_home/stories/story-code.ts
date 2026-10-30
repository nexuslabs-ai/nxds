import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { highlightSample } from '../../_lib/code-sample';

import {
  allStories,
  isExample,
  type Story,
  STORY_FILE,
} from './story-test-model';

import 'server-only';

type StoryCodeToken = { content: string; color?: string };

/** A story's highlighted lines, and the line each of its checks runs. */
export type StoryCodeEntry = {
  tokens: StoryCodeToken[][];
  lines: number[];
};

/** Each story's highlighted source, by story name. */
export type StoryCode = Record<string, StoryCodeEntry>;

const EXPECT_LINE = /^\s*await expect\(/;

/** A story's export in the story file, from `export const` to its `};`. */
function fileStory(file: string[], story: Story) {
  const start = file.indexOf(`export const ${story.name}: Story = {`);
  const end = file.indexOf('};', start);
  if (start === -1 || end === -1)
    throw new Error(`${STORY_FILE} has no story named ${story.name}.`);
  const source = file.slice(start, end + 1);
  const lines = source.flatMap((line, index) =>
    EXPECT_LINE.test(line) ? [index] : []
  );
  if (lines.length !== story.checks.length)
    throw new Error(
      `${story.name} in ${STORY_FILE} runs ${lines.length} expects, but the Stories chapter labels ${story.checks.length}. Update its checks in story-test-model.ts.`
    );
  return { source, lines };
}

/**
 * Highlights every story the Stories chapter can show, at build time, so the
 * highlighter stays out of the client bundle. File stories are read from the
 * story file, so the chapter shows the story CI runs.
 */
export async function highlightStories(): Promise<StoryCode> {
  const file = (
    await readFile(path.join(process.cwd(), '..', '..', STORY_FILE), 'utf8')
  ).split('\n');

  const stories = await Promise.all(
    allStories().map(async (story) => {
      if (
        isExample(story) &&
        file.includes(`export const ${story.name}: Story = {`)
      )
        throw new Error(
          `The example story ${story.name} shares its name with a story in ${STORY_FILE}.`
        );
      const { source, lines } = isExample(story)
        ? story
        : fileStory(file, story);
      const tokens = await highlightSample('tsx', source.join('\n'));
      const entry: StoryCodeEntry = {
        tokens: tokens.map((line) =>
          line.map(({ content, color }) => ({ content, color }))
        ),
        lines: [...lines],
      };
      return [story.name, entry] as const;
    })
  );
  return Object.fromEntries(stories);
}
