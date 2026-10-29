import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from 'playwright';

import { type PageGlobals, type Part, projectDir } from './harness.ts';

/** An element whose computed `property`, or properties, a token or preset should move. */
export interface Probe {
  tree: Part;
  target: string;
  property: string | readonly string[];
}

interface Scope {
  attributes?: Record<string, string>;
  style?: string;
  css?: string;
}

export const BUTTON: Omit<Probe, 'property'> = {
  tree: { part: 'Button', children: ['Save changes'] },
  target: 'button',
};
export const ICON_BUTTON: Omit<Probe, 'property'> = {
  tree: {
    part: 'Button',
    props: { iconOnly: true, startIcon: { __icon: 'download' } },
    children: ['Download'],
  },
  target: 'button svg',
};
export const CARD: Omit<Probe, 'property'> = {
  tree: {
    part: 'Card',
    children: [{ part: 'CardContent', children: ['Quarterly revenue'] }],
  },
  target: '[data-slot="card"]',
};
export const CARD_CONTENT = { ...CARD, target: '[data-slot="card-content"]' };
export const INPUT: Omit<Probe, 'property'> = {
  tree: { part: 'Input', props: { 'aria-label': 'Email' } },
  target: '[data-slot="input"]',
};
export const TABLE_HEAD: Omit<Probe, 'property'> = {
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
export const TEXT_STYLE: Omit<Probe, 'property'> = {
  tree: {
    part: 'p',
    props: { className: 'typography-label-default' },
    children: ['Email address'],
  },
  target: 'p',
};

// Renders `probe.tree` inside a wrapper carrying `scope`, and reads the
// target's computed `probe.property`.
export async function measure(page: Page, probe: Probe, scope: Scope = {}) {
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
export function tokenLists() {
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

export function tokenFamilies() {
  return [...tokenLists().keys(), 'type.families', 'type.groups'];
}
