import {
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright';

import {
  CANVAS_EXAMPLES,
  type CanvasBlock,
} from '../../src/canvas-examples.ts';
import { folderCanvasExample } from '../../src/previews.ts';

import {
  cards,
  compareSignatures,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
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
  const fallbacks: { card: string; markup: string }[] = [];
  const written: (CanvasBlock & { card: string })[] = [];
  for (const card of cards()) {
    const slug = slugs.get(card);
    if (!slug) continue;
    const section = CANVAS_EXAMPLES[card];
    if (section) {
      written.push(...section.blocks.map((block) => ({ card, ...block })));
      continue;
    }
    const example = await folderCanvasExample(slug, parts);
    const readme = readFileSync(
      path.join(projectDir, 'components', card, 'README.md'),
      'utf8'
    );
    const markup = /```html\n([\s\S]*?)\n```/.exec(readme)?.[1];
    if (!example) {
      if (markup) fallbacks.push({ card, markup });
      continue;
    }
    if (markup !== example.markup) {
      fail(
        `${card}: README.md's canvas example isn't its first writable docs story.`
      );
      continue;
    }
    examples.push({ card, markup, tree: example.tree });
  }
  return { examples, fallbacks, written };
}

/** Whether the block, mounted as a canvas does, shows text, an icon or a control. */
async function showsContent(page: Page, block: CanvasBlock) {
  return page.evaluate(async ({ markup, script }) => {
    const { ReactDOM, __nxdsArtboard, __nxdsMarkup, __nxdsSettle } =
      window as unknown as PageGlobals;
    const host = document.createElement('div');
    host.style.width = '640px';
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    try {
      ReactDOM.flushSync(() =>
        root.render(
          script ? __nxdsArtboard(markup, script) : __nxdsMarkup(markup, true)
        )
      );
    } catch (error) {
      root.unmount();
      host.remove();
      return { error: error instanceof Error ? error.message : String(error) };
    }
    await __nxdsSettle(host);
    const shows =
      host.innerText.trim() !== '' ||
      host.querySelector('svg, img, input, button, [role]') !== null;
    root.unmount();
    host.remove();
    return { shows };
  }, block);
}

/** How many conditions FilterBuilder shows before and after one click on Add condition. */
async function conditionsAroundAdd(page: Page, block: CanvasBlock) {
  return page.evaluate(async ({ markup, script }) => {
    const { ReactDOM, __nxdsArtboard, __nxdsMarkup, __nxdsSettle } =
      window as unknown as PageGlobals;
    const host = document.createElement('div');
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    ReactDOM.flushSync(() =>
      root.render(
        script ? __nxdsArtboard(markup, script) : __nxdsMarkup(markup, true)
      )
    );
    await __nxdsSettle(host);
    const conditions = () =>
      host.querySelectorAll('[data-slot="filter-rule-editor"]').length;
    const before = conditions();
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Add condition')
      ?.click();
    await __nxdsSettle(host);
    const after = conditions();
    root.unmount();
    host.remove();
    return { before, after };
  }, block);
}

// FilterBuilder's JSON example takes a click without a handler, and bound to
// its artboard script's state, Add condition adds one.
async function checkFilterBuilder(page: Page, problems: string[]) {
  const blocks = CANVAS_EXAMPLES['FilterBuilder']?.blocks ?? [];
  const mockup = blocks.find((block) => !block.script);
  const bound = blocks.find((block) => block.script);
  if (!mockup || !bound) {
    return fail(
      'FilterBuilder: CANVAS_EXAMPLES needs a JSON example and one bound to its script.'
    );
  }
  await conditionsAroundAdd(page, mockup);
  failOnProblems('FilterBuilder README example, clicked', problems, true);
  const { before, after } = await conditionsAroundAdd(page, bound);
  failOnProblems('FilterBuilder bound to state', problems, true);
  if (after !== before + 1) {
    fail(
      `FilterBuilder bound to state shows ${after} conditions after Add condition, not ${before + 1}.`
    );
  }
}

// Each README example, mounted the way a canvas does, renders what its docs
// story renders as plain React, and logs nothing. A README with no writable
// story shows its root part alone, or the examples CANVAS_EXAMPLES writes,
// and each must mount without a problem and show something.
export async function checkExamples() {
  const { examples, fallbacks, written } = await readmeExamples();
  const { page, problems } = await openPage('Button', LIGHT);
  for (const { card, ...block } of [...fallbacks, ...written]) {
    const shown = await showsContent(page, block);
    if ('error' in shown) {
      fail(`${card}: README.md's canvas example throws ${shown.error}.`);
    } else if (!shown.shows) {
      fail(
        `${card}: README.md's canvas example shows nothing. Write one in CANVAS_EXAMPLES in src/canvas-examples.ts.`
      );
    }
    failOnProblems(`${card} README example`, problems, true);
  }
  for (const { card, markup, tree } of examples) {
    const expected = await signatureOf(page, { tree });
    failOnProblems(`${card} README example`, problems, false);
    const canvas = await signatureOf(page, { markup });
    failOnProblems(`${card} README example`, problems, true);
    compareSignatures(`${card} README example`, expected, canvas);
  }
  await checkFilterBuilder(page, problems);
  await page.close();
  return examples.length + fallbacks.length + written.length;
}
