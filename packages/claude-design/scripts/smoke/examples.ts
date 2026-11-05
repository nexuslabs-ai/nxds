import {
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright';

import { CANVAS_EXAMPLES } from '../../src/canvas-examples.ts';
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
  const written: { card: string; markup: string }[] = [];
  for (const card of cards()) {
    const slug = slugs.get(card);
    if (!slug) continue;
    const example = await folderCanvasExample(slug, parts);
    const readme = readFileSync(
      path.join(projectDir, 'components', card, 'README.md'),
      'utf8'
    );
    const markup = /```html\n([\s\S]*?)\n```/.exec(readme)?.[1];
    if (card in CANVAS_EXAMPLES) {
      // A binding needs the artboard's script, and a script isn't markup.
      for (const [, block = ''] of readme.matchAll(
        /```html\n([\s\S]*?)\n```/g
      )) {
        if (!block.includes('{{') && !block.startsWith('<script')) {
          written.push({ card, markup: block });
        }
      }
      continue;
    }
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

/** Whether `markup`, mounted as a canvas does, shows text, an icon or a control. */
async function showsContent(page: Page, markup: string) {
  return page.evaluate(async (markup) => {
    const { ReactDOM, __nxdsMarkup, __nxdsSettle } =
      window as unknown as PageGlobals;
    const host = document.createElement('div');
    host.style.width = '640px';
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    try {
      ReactDOM.flushSync(() => root.render(__nxdsMarkup(markup, true)));
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
  }, markup);
}

/** FilterBuilder mounted from its README markup, or bound to state as `{{filters}}` and `{{setFilters}}` bind it. */
type FilterMount =
  | { markup: string }
  | { bound: { fields: string; value: string } };

/** How many conditions FilterBuilder shows after one click on Add condition. */
async function conditionsAfterAdd(page: Page, mount: FilterMount) {
  return page.evaluate(async (mount) => {
    const { React, ReactDOM, Nxds, __nxdsMarkup, __nxdsSettle } =
      window as unknown as PageGlobals;
    // A canvas passes `{{filters}}` as the state object and `{{setFilters}}`
    // as the function that sets it.
    function Bound({ fields, value }: { fields: string; value: string }) {
      const [filters, setFilters] = React.useState(() => JSON.parse(value));
      return React.createElement(Nxds['FilterBuilder'] as React.ElementType, {
        fields,
        value: filters,
        onValueChange: setFilters,
      });
    }
    const host = document.createElement('div');
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    ReactDOM.flushSync(() =>
      root.render(
        'markup' in mount
          ? __nxdsMarkup(mount.markup, true)
          : React.createElement(Bound, mount.bound)
      )
    );
    await __nxdsSettle(host);
    [...host.querySelectorAll('button')]
      .find((button) => button.textContent?.trim() === 'Add condition')
      ?.click();
    await __nxdsSettle(host);
    const count = host.querySelectorAll(
      '[data-slot="filter-rule-editor"]'
    ).length;
    root.unmount();
    host.remove();
    return count;
  }, mount);
}

// FilterBuilder's JSON example takes a click without a handler, and bound to
// state the way its README shows, Add condition adds one.
async function checkFilterBuilder(
  page: Page,
  problems: string[],
  written: readonly { card: string; markup: string }[]
) {
  const example = written.find(({ card }) => card === 'FilterBuilder');
  if (!example) return fail('FilterBuilder: README.md has no JSON example.');
  await conditionsAfterAdd(page, { markup: example.markup });
  failOnProblems('FilterBuilder README example, clicked', problems, true);
  const attribute = (name: string) =>
    new RegExp(`\\s${name}='([^']*)'`).exec(example.markup)?.[1] ?? '';
  const value = attribute('value');
  const conditions = await conditionsAfterAdd(page, {
    bound: { fields: attribute('fields'), value },
  });
  failOnProblems('FilterBuilder bound to state', problems, false);
  const before = (value.match(/"kind":"rule"/g) ?? []).length;
  if (conditions !== before + 1) {
    fail(
      `FilterBuilder bound to state shows ${conditions} conditions after Add condition, not ${before + 1}.`
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
  for (const { card, markup } of [...fallbacks, ...written]) {
    const shown = await showsContent(page, markup);
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
  await checkFilterBuilder(page, problems, written);
  await page.close();
  return examples.length + fallbacks.length + written.length;
}
