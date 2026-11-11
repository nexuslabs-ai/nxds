import { DENSITY_OPTIONS, type NxdsDensity } from '@nxds/core';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright';

import {
  boardEntry,
  SAMPLER_FILE,
  samplerFile,
  samplerTags,
} from '../../src/setup.ts';
import { themedBoard, uiScaleFactor } from '../../src/theme.ts';
import type { ThemeId } from '../../src/tokens.ts';

import {
  exportAppearance,
  exportDir,
  exportTokens,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  projectDir,
} from './harness.ts';

type Mode = ThemeId;

/** The value `attribute` takes on the markup's `Nxds.<part>` tag. */
function attributeOf(markup: string, part: string, attribute: string) {
  const value = samplerTags(markup)
    .find((tag) => tag.part === part)
    ?.attributes.get(attribute);
  if (value === undefined) {
    throw new Error(`${SAMPLER_FILE}: no ${part} ${attribute}.`);
  }
  return value;
}

/** The bars the sampler's BarChart draws: one per value that isn't null. */
function barsOf(markup: string) {
  const rows = JSON.parse(attributeOf(markup, 'BarChart', 'data')) as Record<
    string,
    unknown
  >[];
  const series = attributeOf(markup, 'BarChart', 'series').split(',');
  return rows.flatMap((row) =>
    series.filter((key) => typeof row[key] === 'number')
  ).length;
}

/** The legend labels the sampler's BarChart shows, in series order. */
function legendOf(markup: string) {
  const config = JSON.parse(
    attributeOf(markup, 'BarChart', 'config')
  ) as Record<string, { label: string }>;
  return attributeOf(markup, 'BarChart', 'series')
    .split(',')
    .map((key) => config[key]?.label ?? key);
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

// The parts whose `data-slot` isn't their name in kebab case, and the parts
// that draw none of their own on the board (null): Icon is a bare <svg>, a
// Popover and Tabs root render no element, an as-child trigger takes its
// button's slot, and the popover's content renders only once it opens.
const SLOTS: Record<string, string | null> = {
  BarChart: 'chart',
  DatePicker: null,
  Icon: null,
  InputGroupInput: 'input-group-control',
  Popover: null,
  PopoverContent: null,
  PopoverTrigger: null,
  SidebarProvider: 'sidebar-wrapper',
  Tabs: null,
};

/** Each `Nxds.<Part>` the markup mounts on the board, as the `data-slot` it renders. */
function slotsOf(markup: string) {
  const parts = new Set(samplerTags(markup).flatMap((tag) => tag.part ?? []));
  return [...parts].flatMap((name) => {
    const slot =
      name in SLOTS
        ? SLOTS[name]
        : name.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase();
    return slot ?? [];
  });
}

/** The `canvas.json` entry SETUP.md gives, read from its one json block. */
function shippedBoardEntry() {
  const guide = readFileSync(path.join(exportDir, 'SETUP.md'), 'utf8');
  const blocks = [...guide.matchAll(/```json\n\s*([\s\S]*?)\n\s*```/g)];
  if (blocks.length !== 1) {
    throw new Error(
      "SETUP.md: not exactly one json block, the sampler's canvas.json entry."
    );
  }
  return blocks[0]?.[1]?.trim();
}

type Size = { width: number; height: number };

/** The background of each surface that has to switch with the mode, by its slot. */
const SURFACES =
  '[data-slot="card"], [data-slot="sidebar-inner"], [data-slot="sidebar-inset"], [data-slot="popover-content"]';

/** Where the sampler mounts: its board, mode and the density preset around it. */
type Mount = { size: Size; mode: Mode; density: NxdsDensity };

async function mountSampler(markup: string, mount: Mount) {
  const { page, problems } = await openPage('Button', LIGHT);
  try {
    return { ...(await measureSampler(page, markup, mount)), problems };
  } finally {
    await page.close();
  }
}

async function measureSampler(
  page: Page,
  markup: string,
  { size, mode, density }: Mount
) {
  await page.setViewportSize(size);
  const board = await page.evaluate(
    async ({ markup, height, density }) => {
      const { ReactDOM, __nxdsMarkup, __nxdsSettle } =
        window as unknown as PageGlobals;
      document.body.replaceChildren();
      document.body.style.margin = '0';
      const host = document.createElement('div');
      host.id = 'sampler';
      host.setAttribute('data-density', density);
      document.body.append(host);
      try {
        ReactDOM.flushSync(() =>
          ReactDOM.createRoot(host).render(__nxdsMarkup(markup, true))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { error: `rendering threw ${message}` };
      }
      await __nxdsSettle(host);
      const root = host.querySelector(':scope > div');
      const content = host.querySelector(
        '[data-slot="sidebar-inset"]'
      )?.lastElementChild;
      if (!root || !content) {
        return { error: 'no root <div> or page content to measure.' };
      }
      // A part that spills past its card, or past the board when it sits in
      // no card, by how far. A part inside an ancestor that clips it, such as
      // Progress's indicator, can't, but a clipping ancestor that scrolls
      // sideways is a spill of its own.
      const clipped = (element: Element) => {
        for (
          let parent = element.parentElement;
          parent && parent !== root;
          parent = parent.parentElement
        ) {
          if (getComputedStyle(parent).overflowX !== 'visible') return true;
        }
        return false;
      };
      const overflows: string[] = [];
      for (const element of root.querySelectorAll('[data-slot]')) {
        if (clipped(element)) continue;
        const card = element.parentElement?.closest('[data-slot="card"]');
        const edge = (card ?? root).getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        const past = Math.max(rect.right - edge.right, edge.left - rect.left);
        if (past > 0.5) {
          overflows.push(
            `${element.getAttribute('data-slot')} spills past its ${card ? 'card' : 'board'} by ${Math.round(past)}px`
          );
        }
      }
      for (const element of root.querySelectorAll('*')) {
        const { overflowX } = getComputedStyle(element);
        if (
          (overflowX === 'auto' || overflowX === 'scroll') &&
          element.scrollWidth > element.clientWidth + 1
        ) {
          overflows.push(
            `${element.getAttribute('data-slot') ?? element.tagName.toLowerCase()} scrolls sideways by ${element.scrollWidth - element.clientWidth}px`
          );
        }
      }
      // Card titles and descriptions sit on one line, and each card's content
      // fills its card, with nothing left empty under it.
      const lines = (element: Element) => {
        const { lineHeight } = getComputedStyle(element);
        const line = parseFloat(lineHeight);
        // `normal` has no px value, so the count would be NaN and pass.
        if (!Number.isFinite(line)) return Infinity;
        return Math.round(element.getBoundingClientRect().height / line);
      };
      const wrapped = [
        ...root.querySelectorAll(
          '[data-slot="card-title"], [data-slot="card-description"]'
        ),
      ]
        .filter((element) => lines(element) > 1)
        .map((element) => element.textContent?.trim() ?? '');
      const empty = [...root.querySelectorAll('[data-slot="card-content"]')]
        .map((content) => {
          const last = content.lastElementChild;
          if (!last) return null;
          const bottom =
            content.getBoundingClientRect().bottom -
            parseFloat(getComputedStyle(content).paddingBottom);
          const gap = Math.round(bottom - last.getBoundingClientRect().bottom);
          const title = content
            .closest('[data-slot="card"]')
            ?.querySelector('[data-slot="card-title"]')
            ?.textContent?.trim();
          return gap > 8 ? `${title ?? 'a card'} leaves ${gap}px empty` : null;
        })
        .filter((entry) => entry !== null);
      return {
        overflows,
        wrapped,
        empty,
        legend: [
          ...root.querySelectorAll(
            '[data-slot="chart"] .recharts-legend-wrapper > div > div'
          ),
        ].map((element) => element.textContent?.trim() ?? ''),
        slots: [...root.querySelectorAll('[data-slot]')].map((element) =>
          element.getAttribute('data-slot')
        ),
        bars: root.querySelectorAll('.recharts-bar-rectangle').length,
        bottom: Math.round(
          content.getBoundingClientRect().bottom -
            root.getBoundingClientRect().top
        ),
        scrollHeight: Math.max(document.documentElement.scrollHeight, height),
      };
    },
    {
      markup: markup.replaceAll('{{mode}}', mode),
      height: size.height,
      density,
    }
  );
  if (board.error !== undefined) return { error: board.error };

  const trigger = page.getByRole('button', {
    name: 'This quarter',
    exact: true,
  });
  const popover = page.locator('[data-slot="popover-content"]');
  const opens =
    (await trigger.count()) === 1 &&
    (await trigger
      .click({ timeout: 2000 })
      .then(() => popover.waitFor({ timeout: 2000 }))
      .then(() => true)
      .catch(() => false));
  const open = await page.evaluate(async (surfaces) => {
    const { __nxdsSettle } = window as unknown as PageGlobals;
    await __nxdsSettle(document.body);
    const root = document.querySelector('#sampler > div');
    return {
      selectedDays: document.querySelectorAll(
        '[data-slot="popover-content"] [aria-selected="true"]:not([data-outside])'
      ).length,
      backgrounds: [root, ...document.querySelectorAll(surfaces)].map(
        (element) => ({
          slot: element?.getAttribute('data-slot') ?? 'the root',
          color: element ? getComputedStyle(element).backgroundColor : '',
        })
      ),
    };
  }, SURFACES);
  let closes = false;
  if (opens) {
    await page.keyboard.press('Escape');
    closes = await popover
      .waitFor({ state: 'detached', timeout: 2000 })
      .then(() => true)
      .catch(() => false);
  }
  return { board: { ...board, ...open, opens, closes } };
}

// The sampler the export ships, mounted the way a canvas does in each mode
// of its tweak, renders every part with no console problem, fills its board
// to the height its canvas.json entry gives and stays inside its cards. In
// light mode it also mounts inside each other density's preset, on the board
// that density gets at the export's UI scale, so one export checks a whole
// row of SAMPLER_EXTRA_HEIGHT. The table puts canvas wrappers where only rows
// and cells belong, so the wrapper's own nesting warning is allowed.
export async function checkSampler() {
  const file = readFileSync(path.join(exportDir, SAMPLER_FILE), 'utf8');
  const source = readFileSync(
    path.join(import.meta.dirname, '..', '..', 'content', SAMPLER_FILE),
    'utf8'
  );
  if (file !== source) {
    fail(
      `The export's ${SAMPLER_FILE} isn't content/${SAMPLER_FILE}, byte for byte.`
    );
  }
  const appearance = exportAppearance();
  const { uiScale } = appearance;
  const factor = uiScaleFactor(exportTokens());
  const base = boardEntry(source);
  // The board at the export's UI scale and `density`.
  const boardAt = (density: NxdsDensity) => {
    const board = themedBoard(base, { uiScale, density }, factor)[SAMPLER_FILE];
    if (!board) throw new Error(`${SAMPLER_FILE}: no canvas.json entry.`);
    return { width: board.w, height: board.h };
  };
  const entry = JSON.stringify(themedBoard(base, appearance, factor));
  if (shippedBoardEntry() !== entry) {
    fail(`SETUP.md's canvas.json entry isn't ${entry}.`);
  }
  const types = readFileSync(
    path.join(projectDir, 'components', 'index.d.ts'),
    'utf8'
  );
  const button = /export interface ButtonProps \{[\s\S]*?\n\}/.exec(types)?.[0];
  if (
    !button?.includes('variant?: "') ||
    !button.includes('disabled?: boolean;')
  ) {
    fail(
      "index.d.ts: Button's variant isn't a list of options or disabled isn't a boolean, so step 5's props panel check fails."
    );
  }

  const { markup, height: preview } = samplerFile(source);
  if (preview === undefined) {
    throw new Error(`${SAMPLER_FILE}: $preview has no whole height.`);
  }
  const legend = legendOf(markup);
  const slots = slotsOf(markup);
  const bars = barsOf(markup);
  const days = rangeDaysOf(markup);
  const backgrounds: Partial<Record<Mode, { slot: string; color: string }[]>> =
    {};
  // How much taller the page is at each density than $preview's height.
  const measured: Partial<Record<NxdsDensity, number>> = {};
  let offTable = false;

  const mounts: Mount[] = [
    ...DENSITY_OPTIONS.map(({ value: density }) => ({
      size: boardAt(density),
      mode: 'light' as const,
      density,
    })),
    {
      size: boardAt(appearance.density),
      mode: 'dark',
      density: appearance.density,
    },
  ];
  for (const mount of mounts) {
    const { mode, density } = mount;
    const { height } = mount.size;
    const name = `the sampler in ${mode} at ${density} density`;
    const mounted = await mountSampler(markup, mount);
    failOnProblems(name, mounted.problems, true);
    if ('error' in mounted) {
      fail(`${name}: ${mounted.error}`);
      continue;
    }
    const { board } = mounted;
    for (const slot of slots) {
      if (!board.slots.includes(slot)) fail(`${name}: no ${slot} renders.`);
    }
    for (const overflow of board.overflows) fail(`${name}: ${overflow}.`);
    if (board.bars !== bars) {
      fail(`${name}: the bar chart draws ${board.bars} bars, not ${bars}.`);
    }
    measured[density] = board.bottom - preview;
    if (Math.abs(board.bottom - height) > 1) {
      offTable = true;
      fail(
        `${name}: at the ${uiScale} UI scale the page ends at ${board.bottom}px, but the canvas.json entry gives ${height}px.`
      );
    }
    if (board.legend.join(', ') !== legend.join(', ')) {
      fail(
        `${name}: the legend lists ${board.legend.join(', ')}, not the series order ${legend.join(', ')}.`
      );
    }
    for (const text of board.wrapped) {
      fail(
        `${name}: the card text "${text}" wraps onto two lines, or its line height has no px value.`
      );
    }
    for (const empty of board.empty)
      fail(`${name}: ${empty} under its content.`);
    if (board.scrollHeight > height) {
      fail(
        `${name}: the board scrolls to ${board.scrollHeight}px, past its ${height}px height.`
      );
    }
    if (!board.opens) {
      fail(`${name}: no This quarter button opens its calendar.`);
      continue;
    }
    if (board.selectedDays !== days) {
      fail(
        `${name}: This quarter's calendar selects ${board.selectedDays} days, not ${days}.`
      );
    }
    if (!board.closes)
      fail(`${name}: Escape doesn't close This quarter's calendar.`);
    if (density === appearance.density) backgrounds[mode] = board.backgrounds;
  }
  for (const [index, { slot, color }] of (backgrounds.dark ?? []).entries()) {
    if (color === backgrounds.light?.[index]?.color) {
      fail(`the sampler in dark: ${slot} keeps its light background.`);
    }
  }
  if (!offTable) return;
  const offset = measured.default;
  if (uiScale === 'default' && offset !== undefined && offset !== 0) {
    fail(
      `the sampler at the default UI scale and density ends ${offset}px past $preview. Set $preview's height to ${preview + offset}, then run the smoke test again.`
    );
    return;
  }
  fail(
    `Set SAMPLER_EXTRA_HEIGHT.${uiScale} in src/theme.ts to ${JSON.stringify(measured)}.`
  );
}
