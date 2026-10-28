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
import {
  componentLabel,
  exportedComponentSlugs,
} from '@nxds/source-model/react-sources.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  type BrowserContextOptions,
  chromium,
  type Page,
  type Route,
} from 'playwright';

import { iconSet } from '../src/icon-set.ts';
import { PRESETS } from '../src/presets.ts';
import { folderCanvasExample } from '../src/previews.ts';

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
  __nxdsElement: (tree: Part | string) => ReactModule.ReactNode;
  __nxdsMarkup: (markup: string, wrapped: boolean) => ReactModule.ReactNode;
  __nxdsSignature: (host: Element) => string[];
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

async function openPage(card: string, theme: Theme, on = context) {
  const page = await on.newPage();
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

// `window.__nxdsElement(tree)` renders a `Part` tree as plain React: each
// prop holds its real value, as nxds's own stories pass it.
//
// `window.__nxdsMarkup(markup, wrapped)` renders canvas markup. Every
// attribute arrives as a string, kebab-case to camelCase except `aria-*` and
// `data-*`, and a bare one as "". With `wrapped`, it mounts the markup the way
// a canvas does: every element gets `data-dc-tpl` and its children as an
// array, indentation kept as strings, and every x-import sits inside its own
// `<div class="sc-host-x" style="display: contents">`. Without, it leaves out
// the wrappers and the indentation.
//
// `window.__nxdsSignature(host)` lists what a viewer and a screen reader get
// from each element: tag, part, role, state, classes and text.
function pageHelpers() {
  const NAMES: Record<string, string> = {
    class: 'className',
    for: 'htmlFor',
    htmlfor: 'htmlFor',
    tabindex: 'tabIndex',
    colspan: 'colSpan',
    rowspan: 'rowSpan',
    viewbox: 'viewBox',
    datetime: 'dateTime',
  };
  const SIGNED = [
    'data-slot',
    'role',
    'aria-label',
    'aria-checked',
    'aria-selected',
    'aria-pressed',
    'aria-valuenow',
    'aria-disabled',
    'data-state',
    'data-disabled',
    'data-variant',
    'data-size',
    'type',
    'value',
    'disabled',
    'placeholder',
  ];
  let mounted = 0;
  const globals = () => window as unknown as PageGlobals;
  const camel = (name: string) =>
    /^(?:aria|data)-/.test(name)
      ? name
      : name.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
  const styleObject = (text: string) =>
    Object.fromEntries(
      text
        .split(';')
        .map((declaration) => declaration.split(':').map((side) => side.trim()))
        .filter(([name, value]) => name && value)
        .map(([name = '', value]) => [
          name.startsWith('--') ? name : camel(name),
          value,
        ])
    );
  const part = (name: string) =>
    name
      .replace(/^Nxds\./, '')
      .split('.')
      .reduce<unknown>(
        (scope, key) => (scope as Record<string, unknown> | undefined)?.[key],
        globals().Nxds
      ) as ReactModule.ElementType | undefined;
  const revive = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(revive);
    if (!value || typeof value !== 'object') return value;
    if ('__icon' in value) {
      return globals().React.createElement(
        globals().Nxds['Icon'] as ReactModule.ElementType,
        { name: value.__icon }
      );
    }
    if ('__date' in value) {
      const [year, month, day] = String(value.__date).split('-').map(Number);
      return new Date(year ?? 0, (month ?? 1) - 1, day ?? 1);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, revive(item)])
    );
  };
  const element = (
    tree: Part | string,
    key?: number
  ): ReactModule.ReactNode => {
    const { React } = globals();
    if (typeof tree === 'string') return tree;
    const type =
      tree.part === '' ? React.Fragment : (part(tree.part) ?? tree.part);
    const children = (tree.children ?? []).map((child, index) =>
      element(child, index)
    );
    return React.createElement(
      type,
      { ...(revive(tree.props ?? {}) as object), key },
      ...children
    );
  };
  const compact = (children: ReactModule.ReactNode[]) =>
    children
      .filter((child) => typeof child !== 'string' || child.trim() !== '')
      .map((child) =>
        typeof child === 'string' ? child.trim().replace(/\s+/g, ' ') : child
      );
  const markupNode = (
    node: ChildNode,
    wrapped: boolean,
    key: number
  ): ReactModule.ReactNode => {
    const { React } = globals();
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (!(node instanceof Element)) return null;
    const children = [...node.childNodes]
      .map((child, index) => markupNode(child, wrapped, index))
      .filter((child) => child !== null);
    const content = wrapped ? children : compact(children);
    const tag = node.tagName.toLowerCase();
    if (tag === 'x-import') {
      const name = node.getAttribute('component-from-global-scope') ?? '';
      const props: Record<string, unknown> = {};
      for (const attribute of node.attributes) {
        if (attribute.name === 'component-from-global-scope') continue;
        props[camel(attribute.name)] = attribute.value;
      }
      const type = part(name) ?? name;
      if (!wrapped) {
        return React.createElement(type, { ...props, key }, ...content);
      }
      mounted += 1;
      const rendered = React.createElement(type, {
        ...props,
        ...(content.length > 0 ? { children: content } : {}),
        key: 0,
      });
      return React.createElement('div', {
        key,
        className: 'sc-host-x',
        'data-dc-tpl': String(mounted),
        style: { display: 'contents' },
        children: [rendered],
      });
    }
    const props: Record<string, unknown> = { key };
    for (const attribute of node.attributes) {
      const name = NAMES[attribute.name] ?? attribute.name;
      props[name] =
        name === 'style' ? styleObject(attribute.value) : attribute.value;
    }
    if (wrapped) {
      mounted += 1;
      props['data-dc-tpl'] = String(mounted);
    }
    // A void element such as <input> throws on any `children` prop.
    return content.length > 0
      ? React.createElement(tag, { ...props, children: content })
      : React.createElement(tag, props);
  };
  const markup = (text: string, wrapped: boolean): ReactModule.ReactNode => {
    const { React } = globals();
    const template = document.createElement('template');
    template.innerHTML = text.trim();
    const nodes = [...template.content.childNodes]
      .map((node, index) => markupNode(node, wrapped, index))
      .filter((node) => node !== null);
    return React.createElement(React.Fragment, null, ...compact(nodes));
  };
  const signature = (host: Element) =>
    [...host.querySelectorAll('*')]
      .filter((node) => !node.classList.contains('sc-host-x'))
      .map((node) => {
        const states = SIGNED.filter((name) => node.hasAttribute(name)).map(
          (name) => `${name}=${node.getAttribute(name)}`
        );
        const classes = [...node.classList].sort().join('.');
        const text = [...node.childNodes]
          .filter((child) => child.nodeType === Node.TEXT_NODE)
          .map((child) => child.textContent)
          .join('')
          .replace(/\s+/g, ' ')
          .trim();
        return `${node.tagName.toLowerCase()}${classes ? `.${classes}` : ''}${states.length > 0 ? ` [${states.join(' ')}]` : ''}${text ? ` "${text}"` : ''}`;
      });
  Object.assign(window, {
    __nxdsElement: element,
    __nxdsMarkup: markup,
    __nxdsSignature: signature,
  });
}

function serve(route: Route) {
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
}

/** A browser context that serves the system and has the page helpers. */
async function canvasContext(options: BrowserContextOptions = {}) {
  const created = await browser.newContext({
    viewport: { width: 960, height: 720 },
    ...options,
  });
  await created.addInitScript(pageHelpers);
  await created.route('**/*', serve);
  return created;
}

const context = await canvasContext();

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
      ReactDOM.flushSync(() => root.render(__nxdsElement(probe.tree)));
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

function indented(children: readonly string[]) {
  return children.flatMap((child) =>
    child.split('\n').map((line) => `  ${line}`)
  );
}

/** Canvas markup for an Nxds part: `x('Button', 'variant="outline"', 'Save')`. */
function x(name: string, attributes = '', ...children: string[]) {
  const open = `<x-import component-from-global-scope="Nxds.${name}"${attributes ? ` ${attributes}` : ''}>`;
  if (children.length === 0) return `${open}</x-import>`;
  const [only] = children;
  if (children.length === 1 && only !== undefined && !only.includes('<')) {
    return `${open}${only}</x-import>`;
  }
  return [open, ...indented(children), '</x-import>'].join('\n');
}

/** Markup for a plain element. */
function el(tag: string, attributes = '', ...children: string[]) {
  const open = `<${tag}${attributes ? ` ${attributes}` : ''}>`;
  if (children.length === 0) return `${open}</${tag}>`;
  const [only] = children;
  if (children.length === 1 && only !== undefined && !only.includes('<')) {
    return `${open}${only}</${tag}>`;
  }
  return [open, ...indented(children), `</${tag}>`].join('\n');
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
 * Markup a canvas author writes, part by part, and the reads that show
 * whether nxds's structure survives the wrappers: each must match the same
 * markup rendered without them.
 */
const WRAPPED_CASES: { name: string; markup: string; reads: Read[] }[] = [
  {
    name: 'ButtonGroup joins its buttons',
    markup: x(
      'ButtonGroup',
      '',
      x('Button', 'variant="outline"', 'Archive'),
      x('Button', 'variant="outline"', 'Report'),
      x('Button', 'variant="outline"', 'Snooze')
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
    markup: x(
      'ButtonGroup',
      '',
      x('Button', 'variant="outline"', 'Send'),
      x(
        'DropdownMenu',
        '',
        x(
          'DropdownMenuTrigger',
          'as-child',
          x(
            'Button',
            'variant="outline" size="icon" aria-label="More options"',
            x('Icons.IconChevronDown')
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
    markup: x(
      'AvatarGroup',
      '',
      x('Avatar', '', x('AvatarFallback', '', 'AL')),
      x('Avatar', '', x('AvatarFallback', '', 'BK'))
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
    markup: x(
      'Table',
      'striped',
      x(
        'TableBody',
        '',
        ...['INV001', 'INV002', 'INV003'].map((invoice) =>
          x('TableRow', '', x('TableCell', '', invoice))
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
    markup: x(
      'InputGroup',
      '',
      x('InputGroupAddon', '', x('Icons.IconSearch')),
      x('InputGroupInput', 'placeholder="Search" aria-label="Search"')
    ),
    reads: [
      { target: 'svg', property: 'width' },
      { target: 'input', property: 'padding-left' },
    ],
  },
  {
    name: 'Alert sizes its icon and places its title',
    markup: x(
      'Alert',
      '',
      x('AlertIcon', '', x('Icons.IconInfoCircle')),
      x('AlertTitle', '', 'Heads up'),
      x('AlertDescription', '', 'Your trial ends in three days.')
    ),
    reads: [
      { target: 'svg', property: 'width' },
      { target: '[data-slot="alert-title"]', property: 'grid-column-start' },
      { target: '[data-slot="alert"]', property: 'column-gap' },
    ],
  },
  {
    name: 'SidebarMenuBadge sits beside its button',
    markup: x(
      'SidebarProvider',
      '',
      x(
        'Sidebar',
        '',
        x(
          'SidebarContent',
          '',
          x(
            'SidebarMenu',
            '',
            x(
              'SidebarMenuItem',
              '',
              x(
                'SidebarMenuButton',
                '',
                x('Icons.IconInbox'),
                el('span', '', 'Inbox')
              ),
              x('SidebarMenuBadge', '', '24')
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
    markup: x(
      'Alert',
      '',
      x(
        'AlertIcon',
        '',
        el(
          'svg',
          'viewBox="0 0 24 24" aria-hidden="true"',
          el('circle', 'cx="12" cy="12" r="10"')
        )
      ),
      x('AlertTitle', '', 'Heads up')
    ),
    reads: [
      { target: 'svg', property: 'width' },
      { target: 'svg', property: 'height' },
    ],
  },
  {
    name: 'FieldDescription underlines a raw link',
    markup: x(
      'FieldDescription',
      '',
      'Read the',
      el('a', 'href="#terms"', 'terms'),
      'first.'
    ),
    reads: [{ target: 'a', property: 'text-underline-offset' }],
  },
  {
    name: "an author's rounded card leaves its children square",
    markup: el(
      'div',
      'style="border-radius: 16px; padding: 16px"',
      el('div', 'class="card-header"', x('Button', 'variant="outline"', 'Edit'))
    ),
    reads: [{ target: '.card-header', property: 'border-top-left-radius' }],
  },
  {
    name: 'a Label dims beside a disabled Checkbox',
    markup: el(
      'div',
      'class="nx:flex nx:items-center nx:gap-2"',
      x('Checkbox', 'id="terms" disabled'),
      x('Label', 'html-for="terms"', 'Accept terms')
    ),
    reads: [{ target: '[data-slot="label"]', property: 'color' }],
  },
  {
    name: 'a ChoiceCard in a form shows its disabled control',
    markup: el(
      'form',
      '',
      x(
        'ChoiceCard',
        'html-for="updates"',
        x('Checkbox', 'id="updates" disabled'),
        x('ChoiceCardContent', '', x('ChoiceCardTitle', '', 'Product updates'))
      )
    ),
    reads: [
      { target: '[data-slot="choice-card"]', property: 'background-color' },
      { target: '[data-slot="checkbox"]', property: 'margin-top' },
    ],
  },
  {
    name: 'Accordion drops the last divider',
    markup: x(
      'Accordion',
      'type="single"',
      ...['Shipping', 'Returns'].map((title) =>
        x(
          'AccordionItem',
          `value="${title}"`,
          x('AccordionTrigger', '', title),
          x('AccordionContent', '', `${title} policy`)
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

// Renders `markup`, with or without canvas wrappers, and reads each `read`.
async function readMarkup(
  page: Page,
  markup: string,
  reads: readonly Read[],
  wrapped: boolean
) {
  return page.evaluate(
    ({ markup, reads, wrapped }) => {
      const { ReactDOM, __nxdsMarkup } = window as unknown as PageGlobals;
      const host = document.createElement('div');
      document.body.append(host);
      const root = ReactDOM.createRoot(host);
      try {
        ReactDOM.flushSync(() => root.render(__nxdsMarkup(markup, wrapped)));
      } catch (error) {
        root.unmount();
        host.remove();
        return {
          error: error instanceof Error ? error.message : String(error),
          values: [],
          wrappers: 0,
        };
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
    { markup, reads, wrapped }
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
  for (const { name, markup, reads } of WRAPPED_CASES) {
    const plain = await readMarkup(page, markup, reads, false);
    failOnProblems(name, problems, false);
    const wrapped = await readMarkup(page, markup, reads, true);
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

/** What to render: a typed tree as plain React, or markup the way a canvas mounts it. */
type Mount = { tree: Part } | { markup: string };

// Renders `mount` and reads its signature once it stops changing, so a
// chart's entry animation has finished.
async function signatureOf(page: Page, mount: Mount) {
  return page.evaluate(async (mount) => {
    const { ReactDOM, __nxdsElement, __nxdsMarkup, __nxdsSignature } =
      window as unknown as PageGlobals;
    const host = document.createElement('div');
    host.style.width = '640px';
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    try {
      ReactDOM.flushSync(() =>
        root.render(
          'tree' in mount
            ? __nxdsElement(mount.tree)
            : __nxdsMarkup(mount.markup, true)
        )
      );
    } catch (error) {
      root.unmount();
      host.remove();
      return { error: error instanceof Error ? error.message : String(error) };
    }
    let last: string[] = [];
    for (let tries = 0; tries < 20; tries += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const next = __nxdsSignature(host);
      if (next.join('\n') === last.join('\n')) break;
      last = next;
    }
    root.unmount();
    host.remove();
    return { signature: last };
  }, mount);
}

function compareSignatures(
  name: string,
  expected: Awaited<ReturnType<typeof signatureOf>>,
  canvas: Awaited<ReturnType<typeof signatureOf>>
) {
  if ('error' in expected)
    return fail(`${name}: plain React throws ${expected.error}`);
  if ('error' in canvas)
    return fail(`${name}: the canvas markup throws ${canvas.error}`);
  const [want, got] = [expected.signature, canvas.signature];
  const at = want.findIndex((line, index) => got[index] !== line);
  if (at === -1 && want.length === got.length) return;
  const index = at === -1 ? want.length : at;
  fail(
    `${name}: the canvas markup renders ${got[index] ?? 'nothing'} where plain React renders ${want[index] ?? 'nothing'}.`
  );
}

const iconComponents = new Set(iconSet().map(({ component }) => component));

/** Each card's README example, with the docs story's values as plain React. */
async function readmeExamples() {
  const parts = new Set(
    [
      ...readFileSync(
        path.join(projectDir, 'components', 'index.d.ts'),
        'utf8'
      ).matchAll(/export interface (\w+)Props\b/g),
    ]
      .map((match) => match[1] ?? '')
      .filter((name) => !iconComponents.has(name))
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
async function checkExamples() {
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

const date = (year: number, month: number, day: number) => ({
  __date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
});

const TOGGLES = ['a', 'b', 'c'].map((value) =>
  x(
    'ToggleGroupItem',
    `value="${value}" aria-label="${value}"`,
    value.toUpperCase()
  )
);
const toggleItems = ['a', 'b', 'c'].map((value) =>
  part('ToggleGroupItem', { value, 'aria-label': value }, value.toUpperCase())
);
const FRUITS = [
  ['apple', 'Apple'],
  ['banana', 'Banana'],
] as const;

/** Markup whose attribute strings must convert to the typed props beside it. */
const ATTRIBUTE_CASES: { name: string; markup: string; expected: Part }[] = [
  {
    name: 'a comma list sets a Slider range',
    markup: x('Slider', 'default-value="20,80" aria-label="Price"'),
    expected: part('Slider', { defaultValue: [20, 80], 'aria-label': 'Price' }),
  },
  {
    name: 'one number sets a one-thumb Slider',
    markup: x('Slider', 'default-value=" 50 " max="200" aria-label="Volume"'),
    expected: part('Slider', {
      defaultValue: [50],
      max: 200,
      'aria-label': 'Volume',
    }),
  },
  {
    name: 'Slider markers take "steps" or numbers',
    markup: x(
      'Slider',
      'default-value="40" step="20" markers="steps" aria-label="Level"'
    ),
    expected: part('Slider', {
      defaultValue: [40],
      step: 20,
      markers: 'steps',
      'aria-label': 'Level',
    }),
  },
  {
    name: 'a number sets Progress',
    markup: x('Progress', 'value="60" aria-label="Upload"'),
    expected: part('Progress', { value: 60, 'aria-label': 'Upload' }),
  },
  {
    name: 'a negative number sets a Slider minimum',
    markup: x(
      'Slider',
      'min="-10" max="10" default-value="-5" aria-label="Offset"'
    ),
    expected: part('Slider', {
      min: -10,
      max: 10,
      defaultValue: [-5],
      'aria-label': 'Offset',
    }),
  },
  {
    name: 'a bare attribute is true',
    markup: x('Switch', 'disabled default-checked aria-label="Wi-Fi"'),
    expected: part('Switch', {
      disabled: true,
      defaultChecked: true,
      'aria-label': 'Wi-Fi',
    }),
  },
  {
    name: '"false" is false',
    markup: x('Switch', 'disabled="false" aria-label="Wi-Fi"'),
    expected: part('Switch', { disabled: false, 'aria-label': 'Wi-Fi' }),
  },
  {
    name: 'a literal beside a boolean stays a string',
    markup: x('Checkbox', 'checked="indeterminate" aria-label="Select all"'),
    expected: part('Checkbox', {
      checked: 'indeterminate',
      'aria-label': 'Select all',
    }),
  },
  {
    name: 'a numeric literal converts to its number',
    markup: x('ToggleGroup', 'type="single" spacing="2"', ...TOGGLES),
    expected: part(
      'ToggleGroup',
      { type: 'single', spacing: 2 },
      ...toggleItems
    ),
  },
  {
    name: 'type="multiple" reads a comma list',
    markup: x('ToggleGroup', 'type="multiple" default-value="b,c"', ...TOGGLES),
    expected: part(
      'ToggleGroup',
      { type: 'multiple', defaultValue: ['b', 'c'] },
      ...toggleItems
    ),
  },
  {
    name: 'type="single" keeps a comma in its one value',
    markup: x('ToggleGroup', 'type="single" default-value="a,b"', ...TOGGLES),
    expected: part(
      'ToggleGroup',
      { type: 'single', defaultValue: 'a,b' },
      ...toggleItems
    ),
  },
  {
    name: 'JSON escapes a comma in a list',
    markup: x(
      'ToggleGroup',
      `type="multiple" default-value='["a","c"]'`,
      ...TOGGLES
    ),
    expected: part(
      'ToggleGroup',
      { type: 'multiple', defaultValue: ['a', 'c'] },
      ...toggleItems
    ),
  },
  {
    name: 'a multiple Accordion opens each listed item',
    markup: x(
      'Accordion',
      'type="multiple" default-value="shipping,returns"',
      ...['shipping', 'returns'].map((value) =>
        x(
          'AccordionItem',
          `value="${value}"`,
          x('AccordionTrigger', '', value),
          x('AccordionContent', '', `${value} policy`)
        )
      )
    ),
    expected: part(
      'Accordion',
      { type: 'multiple', defaultValue: ['shipping', 'returns'] },
      ...['shipping', 'returns'].map((value) =>
        part(
          'AccordionItem',
          { value },
          part('AccordionTrigger', null, value),
          part('AccordionContent', null, `${value} policy`)
        )
      )
    ),
  },
  {
    name: 'MultiSelect shows chips for its default values through the wrappers',
    markup: x(
      'MultiSelect',
      'default-values="apple,banana"',
      x(
        'MultiSelectTrigger',
        'aria-label="Fruit"',
        x('MultiSelectValue', 'placeholder="Pick fruit"')
      ),
      x(
        'MultiSelectContent',
        '',
        ...FRUITS.map(([value, label]) =>
          x('MultiSelectItem', `value="${value}"`, label)
        )
      )
    ),
    expected: part(
      'MultiSelect',
      { defaultValues: ['apple', 'banana'] },
      part(
        'MultiSelectTrigger',
        { 'aria-label': 'Fruit' },
        part('MultiSelectValue', { placeholder: 'Pick fruit' })
      ),
      part(
        'MultiSelectContent',
        null,
        ...FRUITS.map(([value, label]) =>
          part('MultiSelectItem', { value }, label)
        )
      )
    ),
  },
  {
    name: 'an ISO date selects a day',
    markup: x(
      'DatePicker',
      'mode="single" selected="2026-10-15" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'single',
      selected: date(2026, 10, 15),
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'mode="multiple" reads a comma list of dates',
    markup: x(
      'DatePicker',
      'mode="multiple" selected="2026-10-05,2026-10-09" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'multiple',
      selected: [date(2026, 10, 5), date(2026, 10, 9)],
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'mode="range" reads the first and last date',
    markup: x(
      'DatePicker',
      'mode="range" selected="2026-10-01,2026-10-07" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'range',
      selected: { from: date(2026, 10, 1), to: date(2026, 10, 7) },
      defaultMonth: date(2026, 10, 1),
    }),
  },
  {
    name: 'JSON disables weekends',
    markup: x(
      'DatePicker',
      `mode="single" default-month="2026-10" disabled='[{"dayOfWeek":[0,6]}]'`
    ),
    expected: part('DatePicker', {
      mode: 'single',
      defaultMonth: date(2026, 10, 1),
      disabled: [{ dayOfWeek: [0, 6] }],
    }),
  },
  {
    name: 'JSON dates disable the days before one',
    markup: x(
      'DatePicker',
      `mode="single" default-month="2026-10" disabled='{"before":"2026-10-10"}'`
    ),
    expected: part('DatePicker', {
      mode: 'single',
      defaultMonth: date(2026, 10, 1),
      disabled: { before: date(2026, 10, 10) },
    }),
  },
  {
    name: 'JSON lists FieldError messages',
    markup: x('FieldError', `errors='[{"message":"Enter an email address."}]'`),
    expected: part('FieldError', {
      errors: [{ message: 'Enter an email address.' }],
    }),
  },
  {
    name: 'a number field takes a number',
    markup: x('Input', 'type="number" min="1" max="5" aria-label="Seats"'),
    expected: part('Input', {
      type: 'number',
      min: 1,
      max: 5,
      'aria-label': 'Seats',
    }),
  },
  {
    name: 'a date field keeps its date min',
    markup: x('Input', 'type="date" min="2026-01-01" aria-label="Start"'),
    expected: part('Input', {
      type: 'date',
      min: '2026-01-01',
      'aria-label': 'Start',
    }),
  },
  {
    name: 'an icon prop takes an icon name',
    markup: x('Button', 'start-icon="plus"', 'Create project'),
    expected: part(
      'Button',
      { startIcon: { __icon: 'plus' } },
      'Create project'
    ),
  },
  {
    name: 'an end icon takes an icon name',
    markup: x('Button', 'variant="outline" end-icon="chevron-down"', 'Sort'),
    expected: part(
      'Button',
      { variant: 'outline', endIcon: { __icon: 'chevron-down' } },
      'Sort'
    ),
  },
  {
    name: 'Badge icons take icon names',
    markup: x('Badge', 'left-icon="circle-check" right-icon="x"', 'Paid'),
    expected: part(
      'Badge',
      { leftIcon: { __icon: 'circle-check' }, rightIcon: { __icon: 'x' } },
      'Paid'
    ),
  },
  {
    name: 'an InputGroupButton icon takes an icon name',
    markup: x(
      'InputGroup',
      '',
      x('InputGroupInput', 'aria-label="Search"'),
      x(
        'InputGroupAddon',
        'align="inline-end"',
        x('InputGroupButton', 'start-icon="search" aria-label="Search"')
      )
    ),
    expected: part(
      'InputGroup',
      null,
      part('InputGroupInput', { 'aria-label': 'Search' }),
      part(
        'InputGroupAddon',
        { align: 'inline-end' },
        part('InputGroupButton', {
          startIcon: { __icon: 'search' },
          'aria-label': 'Search',
        })
      )
    ),
  },
  {
    name: 'an icon element in an icon slot passes through',
    markup: x('Button', '', x('Icon', 'name="device-floppy"'), 'Save'),
    expected: part(
      'Button',
      null,
      part('Icon', { name: 'device-floppy' }),
      'Save'
    ),
  },
  {
    name: 'Icon takes its size and stroke as numbers',
    markup: x('Icon', 'name="bell" size="20" stroke="1.5"'),
    expected: part('Icon', { name: 'bell', size: 20, stroke: 1.5 }),
  },
  {
    name: 'an empty Icon label leaves the icon hidden',
    markup: x('Icon', 'name="bell" aria-label=""'),
    expected: part('Icon', { name: 'bell' }),
  },
  {
    name: 'a labelled Icon is an image',
    markup: x('Icon', 'name="bell" aria-label="Notifications"'),
    expected: part('Icon', { name: 'bell', 'aria-label': 'Notifications' }),
  },
  {
    name: 'a link target is a dropdown value',
    markup: x(
      'Breadcrumb',
      '',
      x(
        'BreadcrumbList',
        '',
        x(
          'BreadcrumbItem',
          '',
          x('BreadcrumbLink', 'href="#home" target="_blank"', 'Home')
        )
      )
    ),
    expected: part(
      'Breadcrumb',
      null,
      part(
        'BreadcrumbList',
        null,
        part(
          'BreadcrumbItem',
          null,
          part('BreadcrumbLink', { href: '#home', target: '_blank' }, 'Home')
        )
      )
    ),
  },
];

async function checkAttributes() {
  const { page, problems } = await openPage('Button', LIGHT);
  for (const { name, markup, expected } of ATTRIBUTE_CASES) {
    const want = await signatureOf(page, { tree: expected });
    failOnProblems(name, problems, false);
    const got = await signatureOf(page, { markup });
    failOnProblems(name, problems, true);
    compareSignatures(name, want, got);
  }
  await page.close();
}

/**
 * Markup with an attribute that doesn't fit its prop: it logs exactly
 * `warnings`, renders `expected` (the prop left at its default, or a
 * placeholder for a required one), and never throws.
 */
const BAD_INPUT_CASES: {
  name: string;
  markup: string;
  expected: Part | null;
  warnings: RegExp[];
}[] = [
  {
    name: 'a boolean is lowercase',
    markup: x('Switch', 'disabled="TRUE" aria-label="Wi-Fi"'),
    expected: part('Switch', { 'aria-label': 'Wi-Fi' }),
    warnings: [
      /^\[nxds\] Switch: disabled="TRUE" isn't true or false\. Using the default\.$/,
    ],
  },
  {
    name: 'a number is decimal',
    markup: x('Progress', 'value="0x10" aria-label="Upload"'),
    expected: part('Progress', { 'aria-label': 'Upload' }),
    warnings: [/^\[nxds\] Progress: value="0x10" isn't a number/],
  },
  {
    name: 'an exponent is not a number',
    markup: x('Progress', 'value="1e3" aria-label="Upload"'),
    expected: part('Progress', { 'aria-label': 'Upload' }),
    warnings: [/^\[nxds\] Progress: value="1e3" isn't a number/],
  },
  {
    name: 'a bare number attribute is empty',
    markup: x('Progress', 'value aria-label="Upload"'),
    expected: part('Progress', { 'aria-label': 'Upload' }),
    warnings: [/^\[nxds\] Progress: value="" isn't a number/],
  },
  {
    name: 'a comma list has no empty item',
    markup: x('Slider', 'default-value="20,,80" aria-label="Price"'),
    expected: part('Slider', { 'aria-label': 'Price' }),
    warnings: [/^\[nxds\] Slider: default-value="20,,80" has an empty item/],
  },
  {
    name: 'a literal union takes only its members',
    markup: x('Button', 'variant="huge"', 'Save'),
    expected: part('Button', null, 'Save'),
    warnings: [/^\[nxds\] Button: variant="huge" isn't "link", "default", /],
  },
  {
    name: 'a date that does not exist does not roll over',
    markup: x(
      'DatePicker',
      'mode="single" selected="2026-02-30" default-month="2026-02"'
    ),
    expected: part('DatePicker', {
      mode: 'single',
      defaultMonth: date(2026, 2, 1),
    }),
    warnings: [/^\[nxds\] DatePicker: selected="2026-02-30" isn't a date/],
  },
  {
    name: 'a month that does not exist does not roll over',
    markup: x('DatePicker', 'mode="single" default-month="2026-13"'),
    expected: part('DatePicker', { mode: 'single' }),
    warnings: [/^\[nxds\] DatePicker: default-month="2026-13" isn't a date/],
  },
  {
    name: 'a range needs two dates',
    markup: x(
      'DatePicker',
      'mode="range" selected="2026-10-01" default-month="2026-10"'
    ),
    expected: part('DatePicker', {
      mode: 'range',
      defaultMonth: date(2026, 10, 1),
    }),
    warnings: [/^\[nxds\] DatePicker: selected="2026-10-01" isn't two dates/],
  },
  {
    name: 'JSON must parse',
    markup: x('FieldError', "errors='[{message: oops}]'"),
    expected: part('FieldError', null),
    warnings: [/^\[nxds\] FieldError: errors=".*" isn't valid JSON/],
  },
  {
    name: 'JSON must have the shape its prop takes',
    markup: x('FieldError', `errors='{"message":"Enter an email address."}'`),
    expected: part('FieldError', null),
    warnings: [/^\[nxds\] FieldError: errors=".*" isn't a JSON array/],
  },
  {
    name: 'a required literal union falls back to its first member',
    markup: x('ToggleGroup', 'type="multi"', ...TOGGLES),
    expected: part('ToggleGroup', { type: 'single' }, ...toggleItems),
    warnings: [
      /^\[nxds\] ToggleGroup: type="multi" isn't "single", "multiple"\. Using "single"\.$/,
    ],
  },
  {
    name: 'a required value is never empty',
    markup: x(
      'Select',
      'default-open',
      x(
        'SelectTrigger',
        'aria-label="Fruit"',
        x('SelectValue', 'placeholder="Pick fruit"')
      ),
      x('SelectContent', '', x('SelectItem', 'value', 'Apple'))
    ),
    expected: null,
    warnings: [
      /^\[nxds\] SelectItem: value="" is empty\. Using "value-\d+"\.$/,
    ],
  },
  {
    name: 'an unknown icon name renders nothing',
    markup: x('Icon', 'name="sparkle-heart"'),
    expected: part('', null),
    warnings: [
      /^\[nxds\] Icon: name="sparkle-heart" isn't an icon name in components\/Icon\/README\.md\. Using nothing\.$/,
    ],
  },
  {
    name: 'a component name points at the icon name',
    markup: x('Button', 'start-icon="IconPlus"', 'Create project'),
    expected: part('Button', null, 'Create project'),
    warnings: [
      /^\[nxds\] Button: start-icon="IconPlus" isn't an icon name; write "plus"\. Using the default\.$/,
    ],
  },
  {
    name: 'an icon size is a number',
    markup: x('Icon', 'name="bell" size=""'),
    expected: part('Icon', { name: 'bell' }),
    warnings: [/^\[nxds\] Icon: size="" isn't a number/],
  },
  {
    name: 'one bad value warns once however often it renders',
    markup: el(
      'div',
      '',
      x('Switch', 'disabled="yes" aria-label="Wi-Fi"'),
      x('Switch', 'disabled="yes" aria-label="Bluetooth"'),
      x('Switch', 'disabled="yes" aria-label="Airplane mode"')
    ),
    expected: part(
      'div',
      null,
      part('Switch', { 'aria-label': 'Wi-Fi' }),
      part('Switch', { 'aria-label': 'Bluetooth' }),
      part('Switch', { 'aria-label': 'Airplane mode' })
    ),
    warnings: [/^\[nxds\] Switch: disabled="yes"/],
  },
  {
    name: 'the same bad value warns once per part',
    markup: el(
      'div',
      '',
      x('Switch', 'disabled="yes" aria-label="Wi-Fi"'),
      x('Checkbox', 'disabled="yes" aria-label="Remember me"')
    ),
    expected: part(
      'div',
      null,
      part('Switch', { 'aria-label': 'Wi-Fi' }),
      part('Checkbox', { 'aria-label': 'Remember me' })
    ),
    warnings: [
      /^\[nxds\] Switch: disabled="yes"/,
      /^\[nxds\] Checkbox: disabled="yes"/,
    ],
  },
];

const NXDS_WARNING = /^console warning: (\[nxds\] .*)$/;

// Each case on a fresh page, so no earlier case has already logged its warning.
async function checkBadInput() {
  for (const { name, markup, expected, warnings } of BAD_INPUT_CASES) {
    const { page, problems } = await openPage('Button', LIGHT);
    const got = await signatureOf(page, { markup });
    const logged = problems.splice(0).flatMap((problem) => {
      const match = NXDS_WARNING.exec(problem);
      if (match?.[1]) return [match[1]];
      if (!WRAPPER_NESTING.test(problem)) fail(`${name}: ${problem}`);
      return [];
    });
    if (
      logged.length !== warnings.length ||
      !warnings.every((warning, index) => warning.test(logged[index] ?? ''))
    ) {
      fail(
        `${name}: logged ${logged.length > 0 ? logged.join(' | ') : 'no warning'}, not ${warnings.length} matching ${warnings.join(', ')}.`
      );
    }
    if (expected) {
      const want = await signatureOf(page, { tree: expected });
      failOnProblems(name, problems, false);
      compareSignatures(name, want, got);
    } else if ('error' in got) {
      fail(`${name}: the canvas markup throws ${got.error}`);
    }
    await page.close();
  }
}

// Every icon name the README lists draws an svg.
async function checkIcons() {
  const { page, problems } = await openPage('Button', LIGHT);
  const names = iconSet().map(({ name }) => name);
  const missing = await page.evaluate((names) => {
    const { React, ReactDOM, Nxds } = window as unknown as PageGlobals;
    const host = document.createElement('div');
    document.body.append(host);
    const root = ReactDOM.createRoot(host);
    ReactDOM.flushSync(() =>
      root.render(
        React.createElement(
          React.Fragment,
          null,
          ...names.map((name) =>
            React.createElement(
              'span',
              { key: name, 'data-name': name },
              React.createElement(Nxds['Icon'] as ReactModule.ElementType, {
                name,
              })
            )
          )
        )
      )
    );
    const drawn = names.filter((name) =>
      host.querySelector(`[data-name="${name}"] svg path`)
    );
    root.unmount();
    host.remove();
    return names.filter((name) => !drawn.includes(name));
  }, names);
  failOnProblems('icons', problems, false);
  for (const name of missing) fail(`Icon: "${name}" draws no svg.`);
  await page.close();
  return names.length;
}

// Chile starts daylight saving at midnight, so 6 September 2026 has no
// 00:00. A date still selects its own day there.
const DATE_ZONE = 'America/Santiago';

async function checkTimeZone() {
  const zoned = await canvasContext({ timezoneId: DATE_ZONE });
  const { page, problems } = await openPage('Button', LIGHT, zoned);
  const name = `a date in ${DATE_ZONE}`;
  const want = await signatureOf(page, {
    tree: part('DatePicker', {
      mode: 'single',
      selected: date(2026, 9, 6),
      defaultMonth: date(2026, 9, 1),
    }),
  });
  const got = await signatureOf(page, {
    markup: x(
      'DatePicker',
      'mode="single" selected="2026-09-06" default-month="2026-09"'
    ),
  });
  failOnProblems(name, problems, true);
  compareSignatures(name, want, got);
  const selected = (got.signature ?? []).some((line) =>
    line.includes('aria-label=Sunday, September 6th, 2026, selected')
  );
  if (!selected) fail(`${name}: 2026-09-06 isn't the selected day.`);
  await zoned.close();
}

/** Overlays mounted as separate x-imports, opened from an `as-child` Button. */
const trigger = (name: string, label: string) =>
  x(name, 'as-child', x('Button', 'variant="outline"', label));

const WRAPPED_OVERLAYS: {
  name: string;
  markup: string;
  open: string;
  hover?: boolean;
  escape?: boolean;
}[] = [
  {
    name: 'Popover',
    markup: x(
      'Popover',
      '',
      trigger('PopoverTrigger', 'Open popover'),
      x('PopoverContent', '', 'Place content for the popover here.')
    ),
    open: '[data-slot="popover-content"]',
  },
  {
    name: 'DropdownMenu',
    markup: x(
      'DropdownMenu',
      '',
      trigger('DropdownMenuTrigger', 'Open menu'),
      x('DropdownMenuContent', '', x('DropdownMenuItem', '', 'Profile'))
    ),
    open: '[role="menu"]',
  },
  {
    name: 'Dialog',
    markup: x(
      'Dialog',
      '',
      trigger('DialogTrigger', 'Edit profile'),
      x(
        'DialogContent',
        'title="Edit profile" description="Change your name and email."'
      )
    ),
    open: '[role="dialog"]',
  },
  {
    name: 'Sheet',
    markup: x(
      'Sheet',
      '',
      trigger('SheetTrigger', 'Open settings'),
      x(
        'SheetContent',
        '',
        x(
          'SheetHeader',
          '',
          x('SheetTitle', '', 'Settings'),
          x('SheetDescription', '', 'Manage your account.')
        )
      )
    ),
    open: '[role="dialog"]',
  },
  {
    name: 'Tooltip',
    markup: x(
      'Tooltip',
      '',
      trigger('TooltipTrigger', 'Add to library'),
      x('TooltipContent', '', 'Add to library')
    ),
    open: '[role="tooltip"]',
    hover: true,
    escape: false,
  },
  {
    name: 'HoverCard',
    markup: x(
      'HoverCard',
      'open-delay="0"',
      trigger('HoverCardTrigger', '@nxds'),
      x('HoverCardContent', '', 'The nxds design system.')
    ),
    open: '[data-slot="hover-card-content"]',
    hover: true,
    escape: false,
  },
  {
    name: 'Collapsible',
    markup: x(
      'Collapsible',
      '',
      trigger('CollapsibleTrigger', 'Show details'),
      x('CollapsibleContent', '', 'Shipped on 4 March.')
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
    ({ markup, wrapped }) => {
      const { ReactDOM, __nxdsMarkup } = window as unknown as PageGlobals;
      const host = document.createElement('div');
      host.id = 'overlay-host';
      host.style.padding = '120px';
      document.body.append(host);
      ReactDOM.createRoot(host).render(__nxdsMarkup(markup, wrapped));
    },
    { markup: overlay.markup, wrapped }
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
const exampleCount = await checkExamples();
await checkAttributes();
await checkBadInput();
await checkTimeZone();
const iconCount = await checkIcons();
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
  `Smoke test passed: ${cards().length} cards in two themes, ${OVERLAYS.length} overlays, ${WRAPPED_CASES.length} trees and ${WRAPPED_OVERLAYS.length} overlays through canvas wrappers, ${exampleCount} README examples against their stories, ${ATTRIBUTE_CASES.length} attribute conversions, ${BAD_INPUT_CASES.length} bad attributes, ${iconCount} icons, ${TOKEN_CASES.length} token overrides, ${PRESET_CASES.length} preset attributes.`
);
