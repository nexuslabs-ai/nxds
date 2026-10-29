import type * as ReactModule from 'react';

import type { Page } from 'playwright';

import {
  DARK,
  DARK_CLASS,
  el,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  type Theme,
  x,
} from './harness.ts';

/**
 * A static Toast's markup, and the `toast()` call that shows the same toast
 * in a real Toaster. Each must look the same, part for part.
 */
export const TOAST_CASES: {
  name: string;
  markup: string;
  variant: 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';
  title: string;
  options?: Record<string, unknown>;
  richColors?: boolean;
  theme?: Theme;
}[] = [
  {
    name: 'a title alone',
    markup: x('Toast', 'title="Event has been created"'),
    variant: 'default',
    title: 'Event has been created',
  },
  {
    name: 'a success with a description',
    markup: x(
      'Toast',
      'variant="success" title="Changes saved" description="Your profile is up to date."'
    ),
    variant: 'success',
    title: 'Changes saved',
    options: { description: 'Your profile is up to date.' },
  },
  {
    name: 'an action and a cancel',
    markup: x(
      'Toast',
      'title="Message archived" action="Undo" cancel="Dismiss"'
    ),
    variant: 'default',
    title: 'Message archived',
    options: { action: { label: 'Undo' }, cancel: { label: 'Dismiss' } },
  },
  {
    name: 'a close button',
    markup: x(
      'Toast',
      'variant="info" title="A new version is available" close-button'
    ),
    variant: 'info',
    title: 'A new version is available',
    options: { closeButton: true },
  },
  {
    name: 'a long message wraps',
    markup: x(
      'Toast',
      `variant="warning" title="${'Your session is about to expire. '.repeat(5).trim()}" description="${'Save your work to keep it. '.repeat(8).trim()}"`
    ),
    variant: 'warning',
    title: 'Your session is about to expire. '.repeat(5).trim(),
    options: { description: 'Save your work to keep it. '.repeat(8).trim() },
  },
  ...(['success', 'info', 'warning', 'error'] as const).map((variant) => ({
    name: `rich ${variant} colours`,
    markup: x(
      'Toast',
      `variant="${variant}" title="Rich ${variant}" rich-colors`
    ),
    variant,
    title: `Rich ${variant}`,
    richColors: true,
  })),
  {
    name: 'a loading toast',
    markup: x('Toast', 'variant="loading" title="Uploading files"'),
    variant: 'loading',
    title: 'Uploading files',
  },
  {
    name: 'an icon in place of the variant’s',
    markup: x('Toast', 'variant="success" title="Reminder set" icon="bell"'),
    variant: 'success',
    title: 'Reminder set',
    options: { icon: { __icon: 'bell' } },
  },
  {
    name: 'a dark error',
    markup: x('Toast', 'variant="error" title="Something went wrong"'),
    variant: 'error',
    title: 'Something went wrong',
    theme: DARK,
  },
  {
    name: 'a dark toast under the .dark class',
    markup: x('Toast', 'title="Event has been created"'),
    variant: 'default',
    title: 'Event has been created',
    theme: DARK_CLASS,
  },
];

const TOAST_STYLES = [
  'width',
  'background-color',
  'color',
  'border-top-width',
  'border-top-color',
  'border-top-left-radius',
  'padding-top',
  'padding-left',
  'box-shadow',
  'font-size',
  'font-weight',
  'line-height',
  'column-gap',
];

// Shows the toast both ways and reads each part of each: the toast, its
// title, description, icon and buttons.
async function readToasts(page: Page, toastCase: (typeof TOAST_CASES)[number]) {
  return page.evaluate(
    async ({ toastCase, styles }) => {
      const { React, ReactDOM, Nxds, __nxdsMarkup } =
        window as unknown as PageGlobals;
      const real = document.createElement('div');
      const canvas = document.createElement('div');
      canvas.style.padding = '24px';
      document.body.append(real, canvas);
      const realRoot = ReactDOM.createRoot(real);
      const canvasRoot = ReactDOM.createRoot(canvas);
      ReactDOM.flushSync(() => {
        realRoot.render(
          React.createElement(Nxds['Toaster'] as ReactModule.ElementType, {
            richColors: toastCase.richColors ?? false,
          })
        );
        canvasRoot.render(__nxdsMarkup(toastCase.markup, true));
      });
      const show = Nxds['toast'] as ((title: string, options: object) => void) &
        Record<string, (title: string, options: object) => void>;
      const options: Record<string, unknown> = {
        duration: Infinity,
        ...toastCase.options,
      };
      for (const key of ['action', 'cancel'] as const) {
        const button = options[key] as { label: string } | undefined;
        if (button) options[key] = { label: button.label, onClick: () => {} };
      }
      const icon = options['icon'] as { __icon: string } | undefined;
      if (icon) {
        options['icon'] = React.createElement(
          Nxds['Icon'] as ReactModule.ElementType,
          { name: icon.__icon }
        );
      }
      (toastCase.variant === 'default' ? show : show[toastCase.variant])?.(
        toastCase.title,
        options
      );
      await new Promise((resolve) => setTimeout(resolve, 800));
      // A loading spinner spins forever; the rest settle.
      for (const animation of document.getAnimations()) {
        if (animation.effect?.getComputedTiming().endTime !== Infinity)
          animation.finish();
      }
      const read = (root: Element) => {
        const toast = root.querySelector('[data-sonner-toast]');
        if (!toast) return null;
        const parts: Record<string, string> = {};
        for (const [label, selector] of [
          ['toast', ':scope'],
          ['title', '[data-title]'],
          ['description', '[data-description]'],
          ['icon', '[data-icon] svg'],
          ['action', '[data-button]:not([data-cancel])'],
          ['cancel', '[data-cancel]'],
          ['close', '[data-close-button]'],
        ] as const) {
          const element =
            selector === ':scope' ? toast : toast.querySelector(selector);
          if (!element) continue;
          const computed = getComputedStyle(element);
          parts[label] = [
            ...styles.map(
              (name) => `${name}: ${computed.getPropertyValue(name)}`
            ),
            `classes: ${element.getAttribute('class') ?? ''}`,
            `height: ${Math.round(element.getBoundingClientRect().height)}`,
          ].join('; ');
        }
        const box = toast.getBoundingClientRect();
        const host = root.getBoundingClientRect();
        return {
          parts,
          inside:
            box.top >= host.top - 1 &&
            box.left >= host.left - 1 &&
            box.bottom <= host.bottom + 1,
        };
      };
      const result = { real: read(real), canvas: read(canvas) };
      realRoot.unmount();
      canvasRoot.unmount();
      real.remove();
      canvas.remove();
      return result;
    },
    { toastCase, styles: TOAST_STYLES }
  );
}

export async function checkToasts() {
  for (const toastCase of TOAST_CASES) {
    const { page, problems } = await openPage(
      'Button',
      toastCase.theme ?? LIGHT
    );
    const { real, canvas } = await readToasts(page, toastCase);
    failOnProblems(`Toast: ${toastCase.name}`, problems, true);
    if (!real || !canvas) {
      fail(
        `Toast: ${toastCase.name}: ${real ? 'the static Toast' : 'toast()'} showed nothing.`
      );
      await page.close();
      continue;
    }
    if (!canvas.inside)
      fail(
        `Toast: ${toastCase.name}: the static Toast sits outside its place.`
      );
    for (const [part, style] of Object.entries(real.parts)) {
      if (canvas.parts[part] === style) continue;
      fail(
        `Toast: ${toastCase.name}: its ${part} is ${canvas.parts[part] ?? 'missing'}, not ${style}.`
      );
    }
    for (const part of Object.keys(canvas.parts)) {
      if (!(part in real.parts))
        fail(`Toast: ${toastCase.name}: has a ${part} toast() doesn't.`);
    }
    await page.close();
  }
}

// Two Toasts stack in the column they sit in, each in its own place.
export async function checkToastStack() {
  const { page, problems } = await openPage('Button', LIGHT);
  const overlap = await page.evaluate(
    async (markup) => {
      const { ReactDOM, __nxdsMarkup } = window as unknown as PageGlobals;
      const host = document.createElement('div');
      document.body.append(host);
      const root = ReactDOM.createRoot(host);
      ReactDOM.flushSync(() => root.render(__nxdsMarkup(markup, true)));
      await new Promise((resolve) => setTimeout(resolve, 800));
      const [first, second] = [
        ...host.querySelectorAll('[data-sonner-toast]'),
      ].map((toast) => toast.getBoundingClientRect());
      root.unmount();
      host.remove();
      if (!first || !second) return 'fewer than two toasts';
      return second.top >= first.bottom
        ? null
        : `the second starts at ${second.top}, inside the first, which ends at ${first.bottom}`;
    },
    el(
      'div',
      'style="display: grid; gap: 12px"',
      x('Toast', 'variant="success" title="Changes saved"'),
      x('Toast', 'title="Event has been created" action="Undo"')
    )
  );
  failOnProblems('Toast stack', problems, true);
  if (overlap) fail(`Toast stack: ${overlap}.`);
  await page.close();
}
