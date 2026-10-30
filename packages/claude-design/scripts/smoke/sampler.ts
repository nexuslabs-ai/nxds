import { readFileSync } from 'node:fs';
import path from 'node:path';

import { samplerArtboard, samplerTags } from '../../src/setup.ts';

import {
  DARK,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  projectDir,
  type Theme,
} from './harness.ts';
import { exportDir } from './release.ts';

/** The artboard markup SETUP.md tells Claude to paste, read from the exported guide. */
function shippedArtboard() {
  const guide = readFileSync(path.join(exportDir, 'SETUP.md'), 'utf8');
  const markup = /```html\n([\s\S]*?)\n```/.exec(guide)?.[1];
  if (!markup) throw new Error('SETUP.md: no html block for the sampler.');
  return markup;
}

/** The value `attribute` takes on the markup's `Nxds.<part>` tag. */
function attributeOf(markup: string, part: string, attribute: string) {
  const value = samplerTags(markup)
    .find((tag) => tag.part === part)
    ?.attributes.get(attribute);
  if (value === undefined)
    throw new Error(`sampler.html: no ${part} ${attribute}.`);
  return value;
}

/** The bars the sampler's BarChart draws: one per data row and series. */
function barsOf(markup: string) {
  const rows = JSON.parse(attributeOf(markup, 'BarChart', 'data')) as unknown[];
  return (
    rows.length * attributeOf(markup, 'BarChart', 'series').split(',').length
  );
}

/** The days the sampler's DatePicker range covers, both ends included. */
function rangeDaysOf(markup: string) {
  const [from = '', to = ''] = attributeOf(
    markup,
    'DatePicker',
    'selected'
  ).split(',');
  return (Date.parse(to) - Date.parse(from)) / 86_400_000 + 1;
}

/** Each `Nxds.<Part>` the markup mounts, as the `data-slot` it renders. */
function slotsOf(markup: string) {
  const parts = new Set(samplerTags(markup).flatMap((tag) => tag.part ?? []));
  // Icon draws a bare <svg>, and BarChart renders as ChartContainer's slot.
  parts.delete('Icon');
  parts.delete('BarChart');
  return [...parts].map((name) =>
    name.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase()
  );
}

async function mountSampler(theme: Theme, markup: string) {
  const { page, problems } = await openPage('Button', theme);
  const result = await page.evaluate(async (markup) => {
    const { ReactDOM, __nxdsMarkup, __nxdsSettle } =
      window as unknown as PageGlobals;
    const host = document.createElement('div');
    host.style.width = '960px';
    document.body.append(host);
    try {
      ReactDOM.flushSync(() =>
        ReactDOM.createRoot(host).render(__nxdsMarkup(markup, true))
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
    await __nxdsSettle(host);
    const background = (selector: string) => {
      const element = host.querySelector(selector);
      return element ? getComputedStyle(element).backgroundColor : null;
    };
    return {
      slots: [...host.querySelectorAll('[data-slot]')].map((element) =>
        element.getAttribute('data-slot')
      ),
      bars: host.querySelectorAll('.recharts-bar-rectangle').length,
      selectedDays: host.querySelectorAll('[aria-selected="true"]').length,
      page: background(':scope > div'),
      dark: background('[data-theme="dark"]'),
    };
  }, markup);
  await page.close();
  return { result, problems };
}

// The sampler SETUP.md ships, pasted after the README's link lines and
// mounted the way a canvas does, renders every part with no console problem
// in both themes. The sampler has no table, so the canvas wrapper's own
// nesting warning doesn't apply either.
export async function checkSampler() {
  const artboard = shippedArtboard();
  const readme = readFileSync(path.join(projectDir, 'README.md'), 'utf8');
  const sampler = readFileSync(
    path.join(import.meta.dirname, '..', '..', 'content', 'sampler.html'),
    'utf8'
  );
  if (artboard !== samplerArtboard(readme, sampler)) {
    fail("SETUP.md's sampler isn't the README's link lines and sampler.html.");
  }
  // The frame already loads the system the way the link lines do.
  const markup = sampler.trim();
  const slots = slotsOf(markup);
  const bars = barsOf(markup);
  const days = rangeDaysOf(markup);

  for (const [label, theme] of [
    ['light', LIGHT],
    ['dark', DARK],
  ] as const) {
    const name = `the sampler in ${label}`;
    const { result, problems } = await mountSampler(theme, markup);
    failOnProblems(name, problems, false);
    if ('error' in result) {
      fail(`${name} throws ${result.error}`);
      continue;
    }
    for (const slot of slots) {
      if (!result.slots.includes(slot)) fail(`${name}: no ${slot} renders.`);
    }
    if (result.bars !== bars) {
      fail(`${name}: the bar chart draws ${result.bars} bars, not ${bars}.`);
    }
    if (result.selectedDays !== days) {
      fail(
        `${name}: the date range selects ${result.selectedDays} days, not ${days}.`
      );
    }
    if (label === 'light' && result.dark === result.page) {
      fail(`${name}: the data-theme="dark" strip keeps the light background.`);
    }
  }
}
