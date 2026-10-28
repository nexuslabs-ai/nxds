// Loads dist/project the way a Design canvas does — React 18.3.1 as page
// globals, then exactly the files the README's "On a Design canvas" section
// links, in its order — and fails on anything a viewer would see break: a
// preview that renders nothing or logs an error in either theme, a theme
// switch that changes nothing, an overlay that doesn't open, close and return
// focus, a token or preset that doesn't reach a component, a tree or overlay
// that changes when each part sits in a canvas wrapper, or a request to the
// network.
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
  __nxdsElement: (
    tree: Part | string,
    wrapped: boolean
  ) => ReactModule.ReactNode;
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

// `window.__nxdsElement(tree, wrapped)` turns a `Part` tree into React
// elements. With `wrapped`, it mounts the tree the way a canvas does: every
// element gets `data-dc-tpl` and its children as an array, and every Nxds part
// sits inside its own `<div class="sc-host-x" style="display: contents">`,
// with the indentation between its content's tags kept as strings.
await context.addInitScript(() => {
  type Node = Part | string;
  let mounted = 0;
  const element = (
    tree: Node,
    wrapped: boolean,
    key?: number
  ): ReactModule.ReactNode => {
    const { React, Nxds } = window as unknown as PageGlobals;
    if (typeof tree === 'string') return tree;
    const part = tree.part.startsWith('Icons.')
      ? Nxds.Icons[tree.part.slice('Icons.'.length)]
      : Nxds[tree.part];
    const type = (part as ReactModule.ElementType | undefined) ?? tree.part;
    const children = (tree.children ?? []).map((child, index) =>
      element(child, wrapped, index)
    );
    if (!wrapped) {
      return React.createElement(type, tree.props ?? null, ...children);
    }
    mounted += 1;
    const tpl = String(mounted);
    // A void element such as <input> throws on any `children` prop.
    const content = children.length > 0 ? { children } : {};
    if (!part) {
      return React.createElement(type, {
        ...tree.props,
        ...content,
        key,
        'data-dc-tpl': tpl,
      });
    }
    const indented = children.every((child) => typeof child === 'string')
      ? content
      : {
          children: [...children.flatMap((child) => ['\n    ', child]), '\n  '],
        };
    const rendered = React.createElement(type, {
      ...tree.props,
      ...indented,
      key: 0,
    });
    return React.createElement('div', {
      key,
      className: 'sc-host-x',
      'data-dc-tpl': tpl,
      style: { display: 'contents' },
      children: [rendered],
    });
  };
  Object.assign(window, { __nxdsElement: element });
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
      const { ReactDOM, __nxdsElement } = window as unknown as PageGlobals;
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
      ReactDOM.flushSync(() => root.render(__nxdsElement(probe.tree, false)));
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

const part = (
  name: string,
  props: Record<string, unknown> | null,
  ...children: (Part | string)[]
): Part => ({ part: name, ...(props ? { props } : {}), children });

/** A read of the `index`th `target`'s computed `property`. */
interface Read {
  target: string;
  property: string;
  index?: number;
}

/**
 * Trees a canvas author builds from separate x-imports, and the reads that
 * show whether nxds's structure survives the wrappers: each must match the
 * same tree rendered without them.
 */
const WRAPPED_CASES: { name: string; tree: Part; reads: Read[] }[] = [
  {
    name: 'ButtonGroup joins its buttons',
    tree: part(
      'ButtonGroup',
      null,
      part('Button', { variant: 'outline' }, 'Archive'),
      part('Button', { variant: 'outline' }, 'Report'),
      part('Button', { variant: 'outline' }, 'Snooze')
    ),
    reads: [
      { target: 'button', index: 0, property: 'border-top-right-radius' },
      { target: 'button', index: 1, property: 'border-left-width' },
      { target: 'button', index: 1, property: 'border-top-left-radius' },
      { target: 'button', index: 2, property: 'border-top-right-radius' },
    ],
  },
  {
    name: 'a split button joins its menu trigger',
    tree: part(
      'ButtonGroup',
      null,
      part('Button', { variant: 'outline' }, 'Send'),
      part(
        'DropdownMenu',
        null,
        part(
          'DropdownMenuTrigger',
          { asChild: true },
          part(
            'Button',
            { variant: 'outline', size: 'icon', 'aria-label': 'More options' },
            part('Icons.IconChevronDown', null)
          )
        )
      )
    ),
    reads: [
      { target: 'button', index: 1, property: 'border-left-width' },
      { target: 'button', index: 1, property: 'border-top-left-radius' },
      { target: 'button', index: 0, property: 'border-top-right-radius' },
    ],
  },
  {
    name: 'AvatarGroup overlaps and rings its avatars',
    tree: part(
      'AvatarGroup',
      null,
      part('Avatar', null, part('AvatarFallback', null, 'AL')),
      part('Avatar', null, part('AvatarFallback', null, 'BK'))
    ),
    reads: [
      {
        target: '[data-slot="avatar"]',
        index: 1,
        property: 'margin-inline-start',
      },
      { target: '[data-slot="avatar"]', index: 0, property: 'box-shadow' },
      {
        target: '[data-slot="avatar-fallback"]',
        property: 'border-top-left-radius',
      },
    ],
  },
  {
    name: 'a striped Table tints and divides its rows',
    tree: part(
      'Table',
      { striped: true },
      part(
        'TableBody',
        null,
        ...['INV001', 'INV002', 'INV003'].map((invoice) =>
          part('TableRow', null, part('TableCell', null, invoice))
        )
      )
    ),
    reads: [
      { target: 'tr', index: 1, property: 'background-color' },
      { target: 'tr', index: 0, property: 'border-bottom-width' },
      { target: 'tr', index: 2, property: 'border-bottom-width' },
    ],
  },
  {
    name: 'InputGroup sizes its icon and pads its input',
    tree: part(
      'InputGroup',
      null,
      part('InputGroupAddon', null, part('Icons.IconSearch', null)),
      part('InputGroupInput', { placeholder: 'Search', 'aria-label': 'Search' })
    ),
    reads: [
      { target: 'svg', property: 'width' },
      { target: 'input', property: 'padding-left' },
    ],
  },
  {
    name: 'Alert sizes its icon and places its title',
    tree: part(
      'Alert',
      null,
      part('AlertIcon', null, part('Icons.IconInfoCircle', null)),
      part('AlertTitle', null, 'Heads up'),
      part('AlertDescription', null, 'Your trial ends in three days.')
    ),
    reads: [
      { target: 'svg', property: 'width' },
      { target: '[data-slot="alert-title"]', property: 'grid-column-start' },
      { target: '[data-slot="alert"]', property: 'column-gap' },
    ],
  },
  {
    name: 'SidebarMenuBadge sits beside its button',
    tree: part(
      'SidebarProvider',
      null,
      part(
        'Sidebar',
        null,
        part(
          'SidebarContent',
          null,
          part(
            'SidebarMenu',
            null,
            part(
              'SidebarMenuItem',
              null,
              part(
                'SidebarMenuButton',
                null,
                part('Icons.IconInbox', null),
                part('span', null, 'Inbox')
              ),
              part('SidebarMenuBadge', null, '24')
            )
          )
        )
      )
    ),
    reads: [
      { target: '[data-slot="sidebar-menu-badge"]', property: 'top' },
      { target: '[data-slot="sidebar-menu-button"] svg', property: 'width' },
      {
        target: '[data-slot="sidebar-menu-button"] > span',
        property: 'text-overflow',
      },
    ],
  },
  {
    name: 'AlertIcon sizes a hand-written svg',
    tree: part(
      'Alert',
      null,
      part(
        'AlertIcon',
        null,
        part(
          'svg',
          { viewBox: '0 0 24 24', 'aria-hidden': true },
          part('circle', { cx: 12, cy: 12, r: 10 })
        )
      ),
      part('AlertTitle', null, 'Heads up')
    ),
    reads: [
      { target: 'svg', property: 'width' },
      { target: 'svg', property: 'height' },
    ],
  },
  {
    name: 'FieldDescription underlines a raw link',
    tree: part(
      'FieldDescription',
      null,
      'Read the ',
      part('a', { href: '#terms' }, 'terms'),
      ' first.'
    ),
    reads: [{ target: 'a', property: 'text-underline-offset' }],
  },
  {
    name: "an author's rounded card leaves its children square",
    tree: part(
      'div',
      { style: { borderRadius: '16px', padding: '16px' } },
      part(
        'div',
        { className: 'card-header' },
        part('Button', { variant: 'outline' }, 'Edit')
      )
    ),
    reads: [{ target: '.card-header', property: 'border-top-left-radius' }],
  },
  {
    name: 'a Label dims beside a disabled Checkbox',
    tree: part(
      'div',
      { className: 'nx:flex nx:items-center nx:gap-2' },
      part('Checkbox', { id: 'terms', disabled: true }),
      part('Label', { htmlFor: 'terms' }, 'Accept terms')
    ),
    reads: [{ target: '[data-slot="label"]', property: 'color' }],
  },
  {
    name: 'a ChoiceCard in a form shows its disabled control',
    tree: part(
      'form',
      null,
      part(
        'ChoiceCard',
        { htmlFor: 'updates' },
        part('Checkbox', { id: 'updates', disabled: true }),
        part(
          'ChoiceCardContent',
          null,
          part('ChoiceCardTitle', null, 'Product updates')
        )
      )
    ),
    reads: [
      { target: '[data-slot="choice-card"]', property: 'background-color' },
      { target: '[data-slot="checkbox"]', property: 'margin-top' },
    ],
  },
  {
    name: 'Accordion drops the last divider',
    tree: part(
      'Accordion',
      { type: 'single' },
      ...['Shipping', 'Returns'].map((title) =>
        part(
          'AccordionItem',
          { value: title },
          part('AccordionTrigger', null, title),
          part('AccordionContent', null, `${title} policy`)
        )
      )
    ),
    reads: [
      {
        target: '[data-slot="accordion-item"]',
        index: 0,
        property: 'border-bottom-width',
      },
      {
        target: '[data-slot="accordion-item"]',
        index: 1,
        property: 'border-bottom-width',
      },
    ],
  },
];

// React logs an element a wrapper puts where HTML doesn't allow it, such as
// a <div> inside <tbody>, and the indentation a canvas keeps inside a table.
// A canvas renders the same tree, so these are its own output, not nxds's.
// React 18 logs the format string with its arguments after it: the element,
// then the parent it can't sit in. One of the two is the wrapper <div>.
const WRAPPER_NESTING =
  /validateDOMNesting\(\.\.\.\): %s cannot appear as a (?:child|descendant) of <%s>\.%s%s%s (?:<div> \w+|<\w+> div|Whitespace text nodes \w+)\s/;

// Renders `tree`, with or without canvas wrappers, and reads each `read`.
async function readTree(
  page: Page,
  tree: Part,
  reads: readonly Read[],
  wrapped: boolean
) {
  return page.evaluate(
    ({ tree, reads, wrapped }) => {
      const { ReactDOM, __nxdsElement } = window as unknown as PageGlobals;
      const host = document.createElement('div');
      document.body.append(host);
      const root = ReactDOM.createRoot(host);
      try {
        ReactDOM.flushSync(() => root.render(__nxdsElement(tree, wrapped)));
      } catch (error) {
        root.unmount();
        host.remove();
        return { error: (error as Error).message, values: [], wrappers: 0 };
      }
      for (const animation of document.getAnimations()) animation.finish();
      const values = reads.map(({ target, property, index = 0 }) => {
        const element = host.querySelectorAll(target)[index];
        return element
          ? getComputedStyle(element).getPropertyValue(property)
          : null;
      });
      const wrappers = host.querySelectorAll('.sc-host-x').length;
      root.unmount();
      host.remove();
      return { error: null, values, wrappers };
    },
    { tree, reads, wrapped }
  );
}

// Fails on every console problem since the last call. A wrapped render may
// log the wrapper's own nesting.
function failOnProblems(name: string, problems: string[], wrapped: boolean) {
  for (const problem of problems.splice(0)) {
    if (wrapped && WRAPPER_NESTING.test(problem)) continue;
    fail(`${name}${wrapped ? ' through canvas wrappers' : ''}: ${problem}`);
  }
}

async function checkWrapped() {
  const { page, problems } = await openPage('Button', LIGHT);
  for (const { name, tree, reads } of WRAPPED_CASES) {
    const plain = await readTree(page, tree, reads, false);
    failOnProblems(name, problems, false);
    const wrapped = await readTree(page, tree, reads, true);
    failOnProblems(name, problems, true);
    if (plain.error) fail(`${name}: the plain tree throws ${plain.error}`);
    if (wrapped.error) {
      fail(
        `${name}: through canvas wrappers, the tree throws ${wrapped.error}`
      );
    }
    if (plain.error || wrapped.error) continue;
    if (wrapped.wrappers === 0)
      fail(`${name}: the wrapped tree has no wrapper.`);
    reads.forEach(({ target, property, index = 0 }, read) => {
      if (plain.values[read] === null) {
        fail(`${name}: the plain tree has no ${target} #${index}.`);
        return;
      }
      if (wrapped.values[read] === plain.values[read]) return;
      fail(
        `${name}: through canvas wrappers, ${target} #${index} has ${property} ${wrapped.values[read] ?? 'no element'} instead of ${plain.values[read]}.`
      );
    });
  }
  await page.close();
}

const trigger = (
  name: string,
  label: string,
  props: Record<string, unknown> = {}
) =>
  part(
    name,
    { asChild: true },
    part('Button', { variant: 'outline', ...props }, label)
  );

/** Overlays mounted as separate x-imports, opened from an `asChild` Button. */
const WRAPPED_OVERLAYS: {
  name: string;
  tree: Part;
  open: string;
  hover?: boolean;
  escape?: boolean;
}[] = [
  {
    name: 'Popover',
    tree: part(
      'Popover',
      null,
      trigger('PopoverTrigger', 'Open popover'),
      part('PopoverContent', null, 'Place content for the popover here.')
    ),
    open: '[data-slot="popover-content"]',
  },
  {
    name: 'DropdownMenu',
    tree: part(
      'DropdownMenu',
      null,
      trigger('DropdownMenuTrigger', 'Open menu'),
      part(
        'DropdownMenuContent',
        null,
        part('DropdownMenuItem', null, 'Profile')
      )
    ),
    open: '[role="menu"]',
  },
  {
    name: 'Dialog',
    tree: part(
      'Dialog',
      null,
      trigger('DialogTrigger', 'Edit profile'),
      part('DialogContent', {
        title: 'Edit profile',
        description: 'Change your name and email.',
      })
    ),
    open: '[role="dialog"]',
  },
  {
    name: 'Sheet',
    tree: part(
      'Sheet',
      null,
      trigger('SheetTrigger', 'Open settings'),
      part(
        'SheetContent',
        null,
        part(
          'SheetHeader',
          null,
          part('SheetTitle', null, 'Settings'),
          part('SheetDescription', null, 'Manage your account.')
        )
      )
    ),
    open: '[role="dialog"]',
  },
  {
    name: 'Tooltip',
    tree: part(
      'Tooltip',
      null,
      trigger('TooltipTrigger', 'Add to library'),
      part('TooltipContent', null, 'Add to library')
    ),
    open: '[role="tooltip"]',
    hover: true,
    escape: false,
  },
  {
    name: 'HoverCard',
    tree: part(
      'HoverCard',
      { openDelay: 0 },
      trigger('HoverCardTrigger', '@nxds'),
      part('HoverCardContent', null, 'The nxds design system.')
    ),
    open: '[data-slot="hover-card-content"]',
    hover: true,
    escape: false,
  },
  {
    name: 'Collapsible',
    tree: part(
      'Collapsible',
      null,
      trigger('CollapsibleTrigger', 'Show details'),
      part('CollapsibleContent', null, 'Shipped on 4 March.')
    ),
    open: '[data-slot="collapsible-content"]',
    escape: false,
  },
];

// Opens the overlay from its button and reads what a viewer sees: the
// button's state, where the content sits against it, and where focus lands
// after Escape.
async function openOverlayTree(
  overlay: (typeof WRAPPED_OVERLAYS)[number],
  wrapped: boolean
) {
  const { page, problems } = await openPage('Button', LIGHT);
  await page.evaluate(
    ({ tree, wrapped }) => {
      const { ReactDOM, __nxdsElement } = window as unknown as PageGlobals;
      const host = document.createElement('div');
      host.id = 'overlay-host';
      host.style.padding = '120px';
      document.body.append(host);
      ReactDOM.createRoot(host).render(__nxdsElement(tree, wrapped));
    },
    { tree: overlay.tree, wrapped }
  );
  const button = page.locator('#overlay-host button').first();
  const rendered = await button.waitFor({ timeout: 2000 }).then(
    () => true,
    () => false
  );
  if (!rendered) {
    await page.close();
    failOnProblems(overlay.name, problems, wrapped);
    return {
      opened: false,
      state: 'no button',
      offset: 'none',
      focus: 'not checked',
    };
  }
  if (overlay.hover) await button.hover();
  else await button.click();
  const content = page.locator(overlay.open).first();
  const opened = await content
    .waitFor({ state: 'visible', timeout: 2000 })
    .then(
      () => true,
      () => false
    );
  const state = await button.evaluate(
    (element) =>
      `aria-expanded=${element.getAttribute('aria-expanded')} data-state=${element.getAttribute('data-state')}`
  );
  const [triggerBox, contentBox] = await Promise.all([
    button.boundingBox(),
    opened ? content.boundingBox() : null,
  ]);
  const offset =
    triggerBox && contentBox
      ? `${Math.round(contentBox.x - triggerBox.x)},${Math.round(contentBox.y - triggerBox.y)}`
      : 'none';
  let focus = 'not checked';
  if (opened && overlay.escape !== false) {
    await page.keyboard.press('Escape');
    await content.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
    focus = await page
      .waitForFunction(
        (element) => element === document.activeElement,
        await button.elementHandle(),
        { timeout: 2000 }
      )
      .then(
        () => 'on the button',
        () => 'elsewhere'
      );
  }
  await page.close();
  failOnProblems(overlay.name, problems, wrapped);
  return { opened, state, offset, focus };
}

async function checkWrappedOverlay(overlay: (typeof WRAPPED_OVERLAYS)[number]) {
  const plain = await openOverlayTree(overlay, false);
  const wrapped = await openOverlayTree(overlay, true);
  if (!plain.opened) fail(`${overlay.name}: didn't open from its button.`);
  for (const key of ['opened', 'state', 'offset', 'focus'] as const) {
    if (wrapped[key] === plain[key]) continue;
    fail(
      `${overlay.name}: through canvas wrappers, ${key} is ${wrapped[key]} instead of ${plain[key]}.`
    );
  }
}

for (const card of cards()) await checkCard(card);
await checkThemes();
for (const overlay of OVERLAYS) await checkOverlay(overlay);
for (const overlay of WRAPPED_OVERLAYS) await checkWrappedOverlay(overlay);
await checkWrapped();
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
  `Smoke test passed: ${cards().length} cards in two themes, ${OVERLAYS.length} overlays, ${WRAPPED_CASES.length} trees and ${WRAPPED_OVERLAYS.length} overlays through canvas wrappers, ${TOKEN_CASES.length} token overrides, ${PRESET_CASES.length} preset attributes.`
);
