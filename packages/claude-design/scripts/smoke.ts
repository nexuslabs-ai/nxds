// Loads dist/project the way a Design canvas does — React 18.3.1 as page
// globals, then exactly the files the README's "On a Design canvas" section
// links, in its order — and fails on anything a viewer would see break: a
// preview that renders nothing or logs an error in either theme, a theme
// switch that changes nothing, an overlay that doesn't open, close and return
// focus, a token or preset that doesn't reach a component, or a request to
// the network.
import type * as ReactModule from 'react';
import type * as ReactDOMModule from 'react-dom';
import type * as ReactDOMClient from 'react-dom/client';

import {
  createNxdsThemeContract,
  DEFAULT_NXDS_APPEARANCE,
  deriveTheme,
  themeToCss,
} from '@nxds/core';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium, type Page } from 'playwright';

import { PRESETS } from '../src/presets.ts';

const packageRoot = path.join(import.meta.dirname, '..');
const projectDir = path.join(packageRoot, 'dist', 'project');
const require = createRequire(path.join(packageRoot, 'package.json'));
const ORIGIN = 'https://system.test';

// Development builds, so React's key, ref and nesting warnings surface.
const REACT = {
  '/lib/react.js': path.join(
    path.dirname(require.resolve('react/package.json')),
    'umd/react.development.js'
  ),
  '/lib/react-dom.js': path.join(
    path.dirname(require.resolve('react-dom/package.json')),
    'umd/react-dom.development.js'
  ),
};

/** The `<link>` and `<script>` lines the README tells a canvas artboard to add, pointed at /project/. */
function canvasLines() {
  const readme = readFileSync(path.join(projectDir, 'README.md'), 'utf8');
  const section = /^## On a Design canvas\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
    readme
  )?.[1];
  const html = /```html\n([\s\S]*?)```/.exec(section ?? '')?.[1];
  if (!html) {
    throw new Error(
      'README.md: no html block under "On a Design canvas" to load the system from.'
    );
  }
  return html
    .trim()
    .split('\n')
    .map((line) => line.replaceAll('ds/<folder>/', '/project/'));
}

const PRELOAD = [
  '<script src="/lib/react.js"></script>',
  '<script src="/lib/react-dom.js"></script>',
  ...canvasLines(),
].join('\n');

type Theme = { attribute: string | null; darkClass: boolean };
const LIGHT: Theme = { attribute: 'light', darkClass: false };
const DARK: Theme = { attribute: 'dark', darkClass: false };
const DARK_CLASS: Theme = { attribute: null, darkClass: true };

/** Overlays that must open from their trigger, close on Escape and return focus. */
const OVERLAYS: {
  card: string;
  trigger: string;
  open: string;
  hover?: boolean;
}[] = [
  { card: 'Dialog', trigger: 'button', open: '[role="dialog"]' },
  { card: 'AlertDialog', trigger: 'button', open: '[role="alertdialog"]' },
  { card: 'Popover', trigger: 'button', open: '[data-slot="popover-content"]' },
  { card: 'DropdownMenu', trigger: 'button', open: '[role="menu"]' },
  { card: 'Select', trigger: '[role="combobox"]', open: '[role="listbox"]' },
  { card: 'Tooltip', trigger: 'button', open: '[role="tooltip"]', hover: true },
];

const failures: string[] = [];

/** The page globals the frame preloads, as far as the checks read them. */
interface PageGlobals {
  React: typeof ReactModule;
  ReactDOM: typeof ReactDOMClient & Pick<typeof ReactDOMModule, 'flushSync'>;
  Nxds: Record<string, unknown> & { Icons: Record<string, unknown> };
}

function fail(message: string) {
  failures.push(message);
}

function frame(previewHtml: string, theme: Theme) {
  const attributes = [
    theme.attribute ? `data-theme="${theme.attribute}"` : '',
    theme.darkClass ? 'class="dark"' : '',
  ].join(' ');
  return previewHtml
    .replace(/<html([^>]*)>/, `<html$1 ${attributes}>`)
    .replace('<head>', `<head>\n${PRELOAD}`);
}

function cards() {
  return readdirSync(path.join(projectDir, 'components'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function openPage(card: string, theme: Theme) {
  const page = await context.newPage();
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(
        `console ${message.type()}: ${message.text().slice(0, 300)}`
      );
    }
  });
  page.on('pageerror', (error) =>
    problems.push(`page error: ${error.message}`)
  );
  const previewHtml = readFileSync(
    path.join(projectDir, 'components', card, 'preview.html'),
    'utf8'
  );
  await page.route(`${ORIGIN}/frame`, (route) =>
    route.fulfill({ contentType: 'text/html', body: frame(previewHtml, theme) })
  );
  await page.goto(`${ORIGIN}/frame`);
  await page.waitForLoadState('load');
  return { page, problems };
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 960, height: 720 },
});

await context.route('**/*', (route) => {
  const url = new URL(route.request().url());
  if (url.origin !== ORIGIN) {
    fail(`network request to ${url.href}`);
    return route.abort();
  }
  const local = REACT[url.pathname as keyof typeof REACT];
  if (local)
    return route.fulfill({ path: local, contentType: 'text/javascript' });
  if (url.pathname.startsWith('/project/')) {
    return route.fulfill({
      path: path.join(projectDir, url.pathname.slice('/project/'.length)),
    });
  }
  if (url.pathname === '/frame') return route.fallback();
  fail(`request for ${url.pathname}, which the system doesn't serve`);
  return route.abort();
});

async function rendered(page: Page) {
  return page.evaluate(() => {
    const root = document.getElementById('root') ?? document.body;
    return (
      root.childElementCount > 0 && root.getBoundingClientRect().height > 0
    );
  });
}

async function checkCard(card: string) {
  for (const theme of [LIGHT, DARK]) {
    const { page, problems } = await openPage(card, theme);
    if (card !== 'Cover' && !(await rendered(page))) {
      fail(`${card} (${theme.attribute}): the preview rendered nothing.`);
    }
    for (const problem of problems)
      fail(`${card} (${theme.attribute}): ${problem}`);
    await page.close();
  }
}

async function background(theme: Theme) {
  const { page } = await openPage('Button', theme);
  const color = await page.evaluate(
    () => getComputedStyle(document.body).backgroundColor
  );
  await page.close();
  return color;
}

async function checkThemes() {
  const light = await background(LIGHT);
  for (const [label, theme] of [
    ['data-theme="dark"', DARK],
    ['the .dark class', DARK_CLASS],
  ] as const) {
    if ((await background(theme)) === light)
      fail(`${label} leaves the page background unchanged.`);
  }
}

async function checkOverlay({
  card,
  trigger,
  open,
  hover,
}: (typeof OVERLAYS)[number]) {
  const { page } = await openPage(card, LIGHT);
  const button = page.locator(trigger).first();
  if (hover) await button.hover();
  else await button.click();
  const content = page.locator(open).first();
  try {
    await content.waitFor({ state: 'visible', timeout: 2000 });
  } catch {
    fail(`${card}: ${open} didn't open from ${trigger}.`);
    await page.close();
    return;
  }
  const box = await content.boundingBox();
  const viewport = page.viewportSize();
  if (
    !box ||
    !viewport ||
    box.x < 0 ||
    box.y < 0 ||
    box.x + box.width > viewport.width ||
    box.y + box.height > viewport.height
  ) {
    fail(`${card}: the open overlay sits outside the viewport.`);
  }
  if (!hover) {
    await page.keyboard.press('Escape');
    await content
      .waitFor({ state: 'hidden', timeout: 2000 })
      .catch(() => fail(`${card}: Escape didn't close it.`));
    // Radix restores focus after its exit animation.
    const focused = await page
      .waitForFunction(
        (element) => element === document.activeElement,
        await button.elementHandle(),
        { timeout: 2000 }
      )
      .then(
        () => true,
        () => false
      );
    if (!focused) fail(`${card}: focus didn't return to the trigger.`);
  }
  await page.close();
}

async function checkRefs() {
  const { page } = await openPage('Button', LIGHT);
  const reached = await page.evaluate(() => {
    const { React, ReactDOM, Nxds } = window as unknown as PageGlobals;
    const results: Record<string, boolean> = {};
    for (const [name, element] of [
      ['Button', HTMLButtonElement],
      ['Input', HTMLInputElement],
    ] as const) {
      const ref = React.createRef<HTMLElement>();
      const host = document.createElement('div');
      document.body.append(host);
      const root = ReactDOM.createRoot(host);
      ReactDOM.flushSync(() =>
        root.render(
          React.createElement(Nxds[name] as ReactModule.ElementType, { ref })
        )
      );
      results[name] = ref.current instanceof element;
    }
    return results;
  });
  for (const [name, ok] of Object.entries(reached)) {
    if (!ok) fail(`${name}: its ref didn't reach the DOM element.`);
  }
  await page.close();
}

async function checkExports() {
  const { page } = await openPage('Button', LIGHT);
  const types = readFileSync(
    path.join(projectDir, 'components', 'index.d.ts'),
    'utf8'
  );
  const names = [...types.matchAll(/export interface (\w+)Props\b/g)].map(
    (match) => match[1] ?? ''
  );
  const missing = await page.evaluate((list) => {
    const { Nxds } = window as unknown as PageGlobals;
    return list.filter((name) => !(Nxds[name] ?? Nxds.Icons[name]));
  }, names);
  for (const name of missing)
    fail(`index.d.ts declares ${name}Props, but window.Nxds has no ${name}.`);
  await page.close();
}

/** A tree of `Nxds` parts, or plain elements, as data a page can render. */
interface Part {
  part: string;
  props?: Record<string, unknown>;
  children?: (Part | string)[];
}

/** An element whose computed `property`, or properties, a token or preset should move. */
interface Probe {
  tree: Part;
  target: string;
  property: string | readonly string[];
}

interface Scope {
  attributes?: Record<string, string>;
  style?: string;
  css?: string;
}

const BUTTON: Omit<Probe, 'property'> = {
  tree: { part: 'Button', children: ['Save changes'] },
  target: 'button',
};
const ICON_BUTTON: Omit<Probe, 'property'> = {
  tree: {
    part: 'Button',
    props: { size: 'icon', 'aria-label': 'Download' },
    children: [{ part: 'svg' }],
  },
  target: 'button svg',
};
const CARD: Omit<Probe, 'property'> = {
  tree: {
    part: 'Card',
    children: [{ part: 'CardContent', children: ['Quarterly revenue'] }],
  },
  target: '[data-slot="card"]',
};
const CARD_CONTENT = { ...CARD, target: '[data-slot="card-content"]' };
const INPUT: Omit<Probe, 'property'> = {
  tree: { part: 'Input', props: { 'aria-label': 'Email' } },
  target: '[data-slot="input"]',
};
const TABLE_HEAD: Omit<Probe, 'property'> = {
  tree: {
    part: 'Table',
    props: { stickyHeader: true },
    children: [
      {
        part: 'TableHeader',
        children: [
          {
            part: 'TableRow',
            children: [{ part: 'TableHead', children: ['Invoice'] }],
          },
        ],
      },
    ],
  },
  target: '[data-slot="table-head"]',
};
const TEXT_STYLE: Omit<Probe, 'property'> = {
  tree: {
    part: 'p',
    props: { className: 'typography-label-default' },
    children: ['Email address'],
  },
  target: 'p',
};

/** One token per tokens.json family, set on a wrapper the way a canvas override is, and what it moves. */
const TOKEN_CASES: (Probe & { family: string; name: string; value: string })[] =
  [
    {
      family: 'color',
      name: '--nx-color-primary-background',
      value: 'rgb(1, 2, 3)',
      ...BUTTON,
      property: 'background-color',
    },
    {
      family: 'spacing',
      name: '--nx-spacing-6',
      value: '37px',
      ...CARD_CONTENT,
      property: 'padding-left',
    },
    {
      family: 'radius',
      name: '--nx-radius-md',
      value: '11px',
      ...INPUT,
      property: 'border-top-left-radius',
    },
    {
      family: 'shadow',
      name: '--nx-shadow-sm',
      value: 'rgb(1, 2, 3) 0px 0px 0px 5px',
      ...CARD,
      property: 'box-shadow',
    },
    {
      family: 'borderWidth',
      name: '--nx-borderwidth-default',
      value: '5px',
      ...CARD,
      property: 'border-top-width',
    },
    {
      family: 'zIndex',
      name: '--nx-z-index-sticky',
      value: '7',
      ...TABLE_HEAD,
      property: 'z-index',
    },
    {
      family: 'motion',
      name: '--nx-motion-ease-enter',
      value: 'linear',
      ...BUTTON,
      property: 'transition-timing-function',
    },
    {
      family: 'icon',
      name: '--nx-icon-glyph-default',
      value: '23px',
      ...ICON_BUTTON,
      property: 'width',
    },
    {
      family: 'typeScale',
      name: '--nx-typography-size-sm',
      value: '23px',
      ...BUTTON,
      property: 'font-size',
    },
    {
      family: 'type.families',
      name: '--nx-typography-family-font-sans',
      value: 'Georgia',
      ...BUTTON,
      property: 'font-family',
    },
    {
      family: 'type.groups',
      name: '--nx-typography-size-sm',
      value: '23px',
      ...TEXT_STYLE,
      property: 'font-size',
    },
  ];

// Each attribute's values, the default first. A preset changes only some of
// its family's tokens, so the check reads them all.
const PRESET_CASES = Object.entries(PRESETS).map(
  ([attribute, { options, initial, family }]) => ({
    attribute,
    family,
    values: [
      initial,
      ...options.map(({ value }) => value).filter((value) => value !== initial),
    ],
  })
);

// Renders `probe.tree` inside a wrapper carrying `scope`, and reads the
// target's computed `probe.property`.
async function measure(page: Page, probe: Probe, scope: Scope = {}) {
  return page.evaluate(
    ({ probe, scope }) => {
      const { React, ReactDOM, Nxds } = window as unknown as PageGlobals;
      type Node = Part | string;
      const build = (node: Node): ReactModule.ReactNode =>
        typeof node === 'string'
          ? node
          : React.createElement(
              (Nxds[node.part] as ReactModule.ElementType | undefined) ??
                node.part,
              node.props ?? null,
              ...(node.children ?? []).map(build)
            );
      const style = document.createElement('style');
      style.textContent = scope.css ?? '';
      document.head.append(style);
      const host = document.createElement('div');
      for (const [name, value] of Object.entries(scope.attributes ?? {})) {
        host.setAttribute(name, value);
      }
      if (scope.style) host.setAttribute('style', scope.style);
      document.body.append(host);
      const root = ReactDOM.createRoot(host);
      ReactDOM.flushSync(() => root.render(build(probe.tree)));
      const element = host.querySelector(probe.target);
      const value = element
        ? [probe.property]
            .flat()
            .map((name) => getComputedStyle(element).getPropertyValue(name))
            .join(' | ')
            .replace(/\s+/g, ' ')
        : null;
      root.unmount();
      host.remove();
      style.remove();
      return value;
    },
    { probe, scope }
  );
}

/** tokens.json's `--name`s, by family. */
function tokenLists() {
  const tokens = JSON.parse(
    readFileSync(path.join(projectDir, 'tokens.json'), 'utf8')
  ) as Record<string, { tokens?: { name: string }[] }>;
  return new Map(
    Object.entries(tokens).flatMap(([key, family]) =>
      Array.isArray(family?.tokens)
        ? [[key, family.tokens.map(({ name }) => `--${name}`)] as const]
        : []
    )
  );
}

function tokenFamilies() {
  return [...tokenLists().keys(), 'type.families', 'type.groups'];
}

async function checkTokens() {
  const covered = new Set(TOKEN_CASES.map(({ family }) => family));
  for (const family of tokenFamilies()) {
    if (!covered.has(family))
      fail(`tokens.json ${family}: no smoke case changes one of its tokens.`);
  }
  const { page } = await openPage('Button', LIGHT);
  for (const { family, name, value, ...probe } of TOKEN_CASES) {
    const before = await measure(page, probe);
    const after = await measure(page, probe, { style: `${name}: ${value}` });
    if (before === null) fail(`${family}: ${probe.target} didn't render.`);
    else if (after === before) {
      fail(
        `${family}: setting ${name} on a wrapper left ${probe.target}'s ${probe.property} at ${before}.`
      );
    }
  }
  await page.close();
}

async function checkPresets() {
  for (const theme of [LIGHT, DARK]) {
    const { page } = await openPage('Button', theme);
    for (const { attribute, family, values } of PRESET_CASES) {
      const probe = { ...CARD, property: tokenLists().get(family) ?? [] };
      const [initial = '', ...others] = values;
      const fallback = await measure(page, probe);
      const base = await measure(page, probe, {
        attributes: { [attribute]: initial },
      });
      if (base !== fallback) {
        fail(
          `${attribute}="${initial}" (${theme.attribute}): differs from the default, ${base} against ${fallback}.`
        );
      }
      for (const value of others) {
        const moved = await measure(page, probe, {
          attributes: { [attribute]: value },
        });
        if (moved === base) {
          fail(
            `${attribute}="${value}" (${theme.attribute}): no ${family} token changes inside it.`
          );
        }
      }
    }
    await page.close();
  }
}

// The provider writes its runtime theme into the nx-runtime layer, which
// must still win over tokens.css.
async function checkRuntimeLayer() {
  const { page } = await openPage('Button', LIGHT);
  const probe = { ...BUTTON, property: 'background-color' };
  const css = themeToCss(
    deriveTheme(
      createNxdsThemeContract({
        ...DEFAULT_NXDS_APPEARANCE,
        brandColor: '#d03801',
      })
    )
  );
  if ((await measure(page, probe, { css })) === (await measure(page, probe))) {
    fail("The provider's nx-runtime theme doesn't override tokens.css.");
  }
  await page.close();
}

for (const card of cards()) await checkCard(card);
await checkThemes();
for (const overlay of OVERLAYS) await checkOverlay(overlay);
await checkRefs();
await checkExports();
await checkTokens();
await checkPresets();
await checkRuntimeLayer();
await browser.close();

if (failures.length > 0) {
  console.error(
    `Smoke test failed:\n${failures.map((failure) => `  ${failure}`).join('\n')}`
  );
  process.exit(1);
}
console.log(
  `Smoke test passed: ${cards().length} cards in two themes, ${OVERLAYS.length} overlays, ${TOKEN_CASES.length} token overrides, ${PRESET_CASES.length} preset attributes.`
);
