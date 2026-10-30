import {
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { folderCanvasExample } from '../../src/previews.ts';

import {
  cards,
  compareSignatures,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type Part,
  projectDir,
  signatureOf,
} from './harness.ts';

/** Each card's README example, with the docs story's values as plain React. */
async function readmeExamples() {
  const parts = new Set(
    [
      ...readFileSync(
        path.join(projectDir, 'components', 'index.d.ts'),
        'utf8'
      ).matchAll(/export interface (\w+)Props\b/g),
    ].map((match) => match[1] ?? '')
  );
  const slugs = new Map(
    [...exportedComponentSlugs()].map((slug) => [componentLabel(slug), slug])
  );
  const examples: { card: string; markup: string; tree: Part }[] = [];
  for (const card of cards()) {
    const slug = slugs.get(card);
    if (!slug) continue;
    const example = await folderCanvasExample(slug, parts);
    if (!example) continue;
    const readme = readFileSync(
      path.join(projectDir, 'components', card, 'README.md'),
      'utf8'
    );
    const markup = /```html\n([\s\S]*?)\n```/.exec(readme)?.[1] ?? '';
    if (markup !== example.markup) {
      fail(
        `${card}: README.md's canvas example isn't its first writable docs story.`
      );
      continue;
    }
    examples.push({ card, markup, tree: example.tree });
  }
  return examples;
}

// Each README example, mounted the way a canvas does, renders what its docs
// story renders as plain React, and logs nothing.
export async function checkExamples() {
  const examples = await readmeExamples();
  const { page, problems } = await openPage('Button', LIGHT);
  for (const { card, markup, tree } of examples) {
    const expected = await signatureOf(page, { tree });
    failOnProblems(`${card} README example`, problems, false);
    const canvas = await signatureOf(page, { markup });
    failOnProblems(`${card} README example`, problems, true);
    compareSignatures(`${card} README example`, expected, canvas);
  }
  await page.close();
  return examples.length;
}
