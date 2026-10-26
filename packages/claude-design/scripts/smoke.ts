// Loads dist/project the way the Design System page and the canvas do —
// React 18.3.1 as page globals, tokens.css, bundle.css, then bundle.js as a
// classic script — and fails on anything a viewer would see break: a preview
// that renders nothing or logs an error in either theme, a theme switch that
// changes nothing, an overlay that doesn't open, close and return focus, or
// a request to the network.
import type * as ReactModule from 'react';
import type * as ReactDOMModule from 'react-dom';
import type * as ReactDOMClient from 'react-dom/client';

import { readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { chromium, type Page } from 'playwright';

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

const PRELOAD = [
  '<link rel="stylesheet" href="/project/tokens.css">',
  '<link rel="stylesheet" href="/project/components/bundle.css">',
  '<script src="/lib/react.js"></script>',
  '<script src="/lib/react-dom.js"></script>',
  '<script src="/project/components/bundle.js"></script>',
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

for (const card of cards()) await checkCard(card);
await checkThemes();
for (const overlay of OVERLAYS) await checkOverlay(overlay);
await checkRefs();
await checkExports();
await browser.close();

if (failures.length > 0) {
  console.error(
    `Smoke test failed:\n${failures.map((failure) => `  ${failure}`).join('\n')}`
  );
  process.exit(1);
}
console.log(
  `Smoke test passed: ${cards().length} cards in two themes, ${OVERLAYS.length} overlays.`
);
