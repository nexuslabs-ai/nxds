import { readFileSync } from 'node:fs';
import path from 'node:path';

import { samplerArtboard } from '../../src/setup.ts';

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

const distDir = path.dirname(projectDir);

/** The artboard markup SETUP.md tells Claude to paste, read from the shipped guide. */
function shippedArtboard() {
  const guide = readFileSync(path.join(distDir, 'SETUP.md'), 'utf8');
  const markup = /```html\n([\s\S]*?)\n```/.exec(guide)?.[1];
  if (!markup) throw new Error('SETUP.md: no html block for the sampler.');
  return markup;
}

/** Each `Nxds.<Part>` the markup mounts, as the `data-slot` it renders. */
function slotsOf(markup: string) {
  const parts = new Set(
    [...markup.matchAll(/component-from-global-scope="Nxds\.(\w+)"/g)].map(
      ([, name = '']) => name
    )
  );
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
    const { ReactDOM, __nxdsMarkup, __nxdsSignature } =
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
    let last: string[] = [];
    for (let tries = 0; tries < 20; tries += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const next = __nxdsSignature(host);
      if (next.join('\n') === last.join('\n')) break;
      last = next;
    }
    const background = (selector: string) => {
      const element = host.querySelector(selector);
      return element ? getComputedStyle(element).backgroundColor : null;
    };
    return {
      signature: last,
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
  const markup = artboard.replace(/^[\s\S]*?\n\n/, '');
  const slots = slotsOf(markup);

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
    if (result.bars !== 12) {
      fail(`${name}: the bar chart draws ${result.bars} bars, not 12.`);
    }
    if (result.selectedDays !== 7) {
      fail(
        `${name}: the date range selects ${result.selectedDays} days, not 7.`
      );
    }
    if (label === 'light' && result.dark === result.page) {
      fail(`${name}: the data-theme="dark" strip keeps the light background.`);
    }
  }
}
