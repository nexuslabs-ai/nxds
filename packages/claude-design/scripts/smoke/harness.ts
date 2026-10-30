// The page a Design canvas loads, and the helpers every check renders and
// reads it with. `openCanvas` points them at an exported folder before any
// check runs. A check records each problem with `fail`.
import type * as ReactModule from 'react';
import type * as ReactDOMModule from 'react-dom';
import type * as ReactDOMClient from 'react-dom/client';

import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import {
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  chromium,
  type Page,
  type Route,
} from 'playwright';

import { canvasLinks } from '../../src/setup.ts';

const packageRoot = path.join(import.meta.dirname, '..', '..');
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
  return canvasLinks(readme).map((line) =>
    line.replaceAll('ds/<folder>/', '/project/')
  );
}

/** The folder `nxds-cli export claude-design` wrote: `project/`, SETUP.md and the rest. */
export let exportDir = '';
export let projectDir = '';
let preload = '';
export let browser: Browser;
let context: BrowserContext;

export type Theme = { attribute: string | null; darkClass: boolean };
export const LIGHT: Theme = { attribute: 'light', darkClass: false };
export const DARK: Theme = { attribute: 'dark', darkClass: false };
export const DARK_CLASS: Theme = { attribute: null, darkClass: true };

export const failures: string[] = [];

/** The page globals the frame preloads, as far as the checks read them. */
export interface PageGlobals {
  React: typeof ReactModule;
  ReactDOM: typeof ReactDOMClient & Pick<typeof ReactDOMModule, 'flushSync'>;
  Nxds: Record<string, unknown>;
  __nxdsElement: (tree: Part | string) => ReactModule.ReactNode;
  __nxdsMarkup: (markup: string, wrapped: boolean) => ReactModule.ReactNode;
  __nxdsSettle: (host: Element) => Promise<string[]>;
}

export function fail(message: string) {
  failures.push(message);
}

function frame(previewHtml: string, theme: Theme) {
  const attributes = [
    theme.attribute ? `data-theme="${theme.attribute}"` : '',
    theme.darkClass ? 'class="dark"' : '',
  ].join(' ');
  return previewHtml
    .replace(/<html([^>]*)>/, `<html$1 ${attributes}>`)
    .replace('<head>', `<head>\n${preload}`);
}

export function cards() {
  return readdirSync(path.join(projectDir, 'components'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export async function openPage(card: string, theme: Theme, on = context) {
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
// `window.__nxdsSettle(host)` waits until what a viewer and a screen reader
// get from each element stops changing, up to four seconds, and returns it:
// tag, part, role, state, classes and text.
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
  const settle = async (host: Element) => {
    let last: string[] = [];
    for (let tries = 0; tries < 20; tries += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const next = signature(host);
      if (next.join('\n') === last.join('\n')) break;
      last = next;
    }
    return last;
  };
  Object.assign(window, {
    __nxdsElement: element,
    __nxdsMarkup: markup,
    __nxdsSettle: settle,
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
export async function canvasContext(options: BrowserContextOptions = {}) {
  const created = await browser.newContext({
    viewport: { width: 960, height: 720 },
    ...options,
  });
  await created.addInitScript(pageHelpers);
  await created.route('**/*', serve);
  return created;
}

/** Loads the export in `folder` the way a canvas does, for every check after it. */
export async function openCanvas(folder: string) {
  exportDir = folder;
  projectDir = path.join(folder, 'project');
  preload = [
    '<script src="/lib/react.js"></script>',
    '<script src="/lib/react-dom.js"></script>',
    ...canvasLines(),
  ].join('\n');
  browser = await chromium.launch();
  context = await canvasContext();
}

export async function rendered(page: Page) {
  return page.evaluate(() => {
    const root = document.getElementById('root') ?? document.body;
    return (
      root.childElementCount > 0 && root.getBoundingClientRect().height > 0
    );
  });
}

/** A tree of `Nxds` parts, or plain elements, as data a page can render. */
export interface Part {
  part: string;
  props?: Record<string, unknown>;
  children?: (Part | string)[];
}

function indented(children: readonly string[]) {
  return children.flatMap((child) =>
    child.split('\n').map((line) => `  ${line}`)
  );
}

/** Canvas markup for an Nxds part: `x('Button', 'variant="outline"', 'Save')`. */
export function x(name: string, attributes = '', ...children: string[]) {
  const open = `<x-import component-from-global-scope="Nxds.${name}"${attributes ? ` ${attributes}` : ''}>`;
  if (children.length === 0) return `${open}</x-import>`;
  const [only] = children;
  if (children.length === 1 && only !== undefined && !only.includes('<')) {
    return `${open}${only}</x-import>`;
  }
  return [open, ...indented(children), '</x-import>'].join('\n');
}

/** Markup for a plain element. */
export function el(tag: string, attributes = '', ...children: string[]) {
  const open = `<${tag}${attributes ? ` ${attributes}` : ''}>`;
  if (children.length === 0) return `${open}</${tag}>`;
  const [only] = children;
  if (children.length === 1 && only !== undefined && !only.includes('<')) {
    return `${open}${only}</${tag}>`;
  }
  return [open, ...indented(children), `</${tag}>`].join('\n');
}

export const part = (
  name: string,
  props: Record<string, unknown> | null,
  ...children: (Part | string)[]
): Part => ({ part: name, ...(props ? { props } : {}), children });

// React logs an element a wrapper puts where HTML doesn't allow it, such as
// a <div> inside <tbody>, and the indentation a canvas keeps inside a table.
// A canvas renders the same tree, so these are its own output, not nxds's.
// React 18 logs the format string with its arguments after it: the element,
// then the parent it can't sit in. One of the two is the wrapper <div>.
export const WRAPPER_NESTING =
  /validateDOMNesting\(\.\.\.\): %s cannot appear as a (?:child|descendant) of <%s>\.%s%s%s (?:<div> \w+|<\w+> div|Whitespace text nodes \w+)\s/;

// Fails on every console problem since the last call. A wrapped render may
// log the wrapper's own nesting.
export function failOnProblems(
  name: string,
  problems: string[],
  wrapped: boolean
) {
  for (const problem of problems.splice(0)) {
    if (wrapped && WRAPPER_NESTING.test(problem)) continue;
    fail(`${name}${wrapped ? ' through canvas wrappers' : ''}: ${problem}`);
  }
}

/** What to render: a typed tree as plain React, or markup the way a canvas mounts it. */
type Mount = { tree: Part } | { markup: string };

// Renders `mount` and reads its signature once it stops changing, so a
// chart's entry animation has finished.
export async function signatureOf(page: Page, mount: Mount) {
  return page.evaluate(async (mount) => {
    const { ReactDOM, __nxdsElement, __nxdsMarkup, __nxdsSettle } =
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
    const signature = await __nxdsSettle(host);
    root.unmount();
    host.remove();
    return { signature };
  }, mount);
}

export function compareSignatures(
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

export const date = (year: number, month: number, day: number) => ({
  __date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
});
