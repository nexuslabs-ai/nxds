import {
  composeStory as composeReactStory,
  type Meta as ReactMeta,
  type StoryObj as ReactStory,
} from '@storybook/react';
import {
  composeStory as composeVueStory,
  type Meta as VueMeta,
  type StoryObj as VueStory,
} from '@storybook/vue3';
import { computeAccessibleName } from 'dom-accessibility-api';
import { fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { describe, expect, it } from 'vitest';

import reactPreview from '../../packages/react/.storybook/preview';
import vuePreview from '../../packages/vue/.storybook/preview';
import {
  renderedAttributeDifferences,
  renderedDifferences,
  shared,
} from '../parity.ts';

/** A stories file: its meta as `default`, and its stories. */
type StoryModule<TMeta, TStory> = { default: TMeta } & Partial<
  Record<string, TStory>
>;
type ReactModule = StoryModule<ReactMeta, ReactStory>;
type VueModule = StoryModule<VueMeta, VueStory>;

const reactModules = import.meta.glob<ReactModule>(
  '../../packages/react/src/components/*/*.stories.tsx'
);
const vueModules = import.meta.glob<VueModule>(
  '../../packages/vue/src/components/*/*.stories.ts'
);

type Opener =
  | {
      /** The trigger's role; the first trigger in the story opens. */
      role: 'button' | 'combobox' | 'menuitem';
      /** Focus opens a tooltip at once, without its hover delay; Enter then opens a navigation flyout. */
      open: 'click' | 'focus' | 'enter';
    }
  /** Right-clicks the context menu's trigger area. */
  | { open: 'contextmenu' };

/** Components whose content renders only once opened, and how to open them. */
const OVERLAYS: Record<string, Opener> = {
  'alert-dialog': { role: 'button', open: 'click' },
  'context-menu': { open: 'contextmenu' },
  dialog: { role: 'button', open: 'click' },
  drawer: { role: 'button', open: 'click' },
  'dropdown-menu': { role: 'button', open: 'click' },
  'hover-card': { role: 'button', open: 'focus' },
  menubar: { role: 'menuitem', open: 'click' },
  'navigation-menu': { role: 'button', open: 'enter' },
  popover: { role: 'button', open: 'click' },
  select: { role: 'combobox', open: 'click' },
  sheet: { role: 'button', open: 'click' },
  tooltip: { role: 'button', open: 'focus' },
};

// Attributes that hold generated ids or inline styles, that Radix, Reka and
// vaul add for their own bookkeeping, or that `name` already covers (aria-label).
const SKIPPED_ATTRIBUTE =
  /^(?:id|style|aria-(?:controls|labelledby|describedby|owns|activedescendant|label)|data-(?:radix|reka)-.*|data-(?:active|dismissable-layer|grace-area-trigger|menu-item|navigation-menu-trigger|slider-impl|vaul-animate|vaul-custom-container))$/;
// ARIA states where `"false"` means the same as leaving the attribute out.
const FALSE_IS_ABSENT =
  /^aria-(?:busy|disabled|hidden|invalid|readonly|required)$/;

function slugOf(file: string) {
  return file.split('/').at(-2) ?? '';
}

async function load<TModule>(
  modules: Record<string, () => Promise<TModule>>,
  slug: string
) {
  const entry = Object.entries(modules).find(([file]) => slugOf(file) === slug);
  if (!entry) throw new Error(`no story file for ${slug}`);
  return entry[1]();
}

function docsStories<TStory extends { tags?: string[] }>(
  module: Partial<Record<string, TStory>>
) {
  return Object.entries(module).flatMap(([name, story]) =>
    name !== 'default' && story?.tags?.includes('docs')
      ? [[name, story] as const]
      : []
  );
}

/** The shared component a part belongs to: the longest slug its `data-slot` starts with. */
function ownerOf(slot: string) {
  return shared
    .filter((slug) => slot === slug || slot.startsWith(`${slug}-`))
    .reduce<
      string | undefined
    >((longest, slug) => (!longest || slug.length > longest.length ? slug : longest), undefined);
}

function isOwnSlot(slot: string, slug: string) {
  return ownerOf(slot) === slug;
}

/** `element`'s text without the CSS Radix and Reka inject as a <style> into a select's viewport. */
function visibleText(element: Element) {
  const copy = element.cloneNode(true) as Element;
  for (const style of copy.querySelectorAll('style')) style.remove();
  return copy.textContent;
}

/** One element as a line, so a mismatch prints as a readable line diff. */
function describeElement(element: Element) {
  // Reka repeats a native `disabled` as `aria-disabled="true"`; Radix doesn't.
  const isNativelyDisabled = element.hasAttribute('disabled');
  const slot = element.getAttribute('data-slot') ?? '';
  const attributes = [...element.attributes]
    .filter(({ name }) => /^(?:data-|aria-|role$)/.test(name))
    .filter(({ name }) => !SKIPPED_ATTRIBUTE.test(name))
    .filter(
      ({ name, value }) => !(FALSE_IS_ABSENT.test(name) && value === 'false')
    )
    .filter(({ name }) => !(name === 'aria-disabled' && isNativelyDisabled))
    .filter(({ name }) => !(`${slot} ${name}` in renderedAttributeDifferences))
    .map(({ name, value }) => `${name}="${value}"`)
    .sort();
  const classes = [...element.classList].map(normalizeClass).sort().join(' ');
  const name =
    `${slot} name` in renderedAttributeDifferences
      ? '(see renderedAttributeDifferences)'
      : computeAccessibleName(element);
  // A textarea shows its value; its text content is only the default value.
  const content =
    element instanceof HTMLTextAreaElement
      ? element.value
      : visibleText(element);
  const text = content?.replace(/\s+/g, ' ').trim() ?? '';
  return `<${element.tagName.toLowerCase()} ${attributes.join(' ')}> class="${classes}" name="${name}" text="${text}"`;
}

/**
 * Every element of `slug`'s own parts on the page, in document order, the
 * `renderedDifferences` slots it skipped, and the value of each
 * `renderedAttributeDifferences` entry it left out, by entry.
 */
function readTree(slug: string) {
  const own = [...document.body.querySelectorAll('[data-slot]')].filter(
    (element) => isOwnSlot(element.getAttribute('data-slot') ?? '', slug)
  );
  const slotOf = (element: Element) => element.getAttribute('data-slot') ?? '';
  const differs = (element: Element) => slotOf(element) in renderedDifferences;
  return {
    tree: own.filter((element) => !differs(element)).map(describeElement),
    skipped: own.filter(differs).map(slotOf),
    leftOut: own.flatMap((element) =>
      Object.keys(renderedAttributeDifferences)
        .filter((entry) => entry.startsWith(`${slotOf(element)} `))
        .map((entry) => {
          const attribute = entry.slice(slotOf(element).length + 1);
          const value =
            attribute === 'name'
              ? computeAccessibleName(element)
              : element.getAttribute(attribute);
          return [entry, value] as const;
        })
    ),
  };
}

async function settle() {
  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  );
}

// Radix and Reka class tokens name their own CSS variables for the same value.
function normalizeClass(token: string) {
  return token.replaceAll('--radix-', '--reka-');
}

/** Opens the story's first trigger; false when it has none that can open, such as plain links or a disabled trigger. */
async function openTrigger(canvasElement: HTMLElement, opener: Opener) {
  if (opener.open === 'contextmenu') {
    const area = canvasElement.querySelector(
      '[data-slot="context-menu-trigger"]'
    );
    if (!area) return false;
    fireEvent.contextMenu(area, {
      clientX: 20,
      clientY: 20,
    });
    return true;
  }
  const [trigger] = within(canvasElement).queryAllByRole(opener.role);
  if (!trigger || trigger.matches(':disabled')) return false;
  if (opener.open === 'click') {
    await userEvent.click(trigger);
    return true;
  }
  trigger.focus();
  if (opener.open === 'enter') await userEvent.keyboard('{Enter}');
  return true;
}

/**
 * Opens `slug`'s first trigger and waits until its content stops moving;
 * false when the story has no trigger that can open.
 */
async function openOverlay(
  canvasElement: HTMLElement,
  slug: string,
  opener: Opener
) {
  if (!(await openTrigger(canvasElement, opener))) return false;

  const content = await waitFor(
    () => {
      const found = document.querySelector(`[data-slot="${slug}-content"]`);
      expect(found).not.toBeNull();
      return found!;
    },
    { timeout: 2000 }
  );
  // A menu moves focus into itself once open, which can highlight an item.
  if (content.matches('[role="menu"], [role="listbox"]')) {
    await waitFor(() =>
      expect(content.contains(document.activeElement)).toBe(true)
    );
  }
  // Popper places the content after measuring it, which can flip its side,
  // and Radix mounts a navigation indicator once a ResizeObserver reports.
  const layout = () =>
    `${content.getAttribute('data-side')}/${content.getAttribute('data-align')}/${document.querySelectorAll('[data-slot]').length}`;
  await waitFor(async () => {
    const before = layout();
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(layout()).toBe(before);
  });
  return true;
}

// `run` mounts the story; without its play function both frameworks read the same initial state.
async function mountReact(
  module: ReactModule,
  name: string,
  story: ReactStory,
  canvasElement: HTMLElement
) {
  const composed = composeReactStory(
    { ...story, play: undefined },
    module.default,
    reactPreview,
    name
  );
  await composed.run({ canvasElement });
  return composed;
}

async function mountVue(
  module: VueModule,
  name: string,
  story: VueStory,
  canvasElement: HTMLElement
) {
  const composed = composeVueStory(
    { ...story, play: undefined },
    module.default,
    vuePreview,
    name
  );
  await composed.run({ canvasElement });
  return composed;
}

async function renderTree(
  mount: (canvasElement: HTMLElement) => Promise<{ load: () => Promise<void> }>,
  slug: string
) {
  // Stories set appearance attributes on <html>, and modal overlays lock <body>.
  const pageElements = [document.documentElement, document.body];
  const pageAttributes = pageElements.map((element) =>
    [...element.attributes].map(({ name, value }) => [name, value] as const)
  );
  const canvasElement = document.createElement('div');
  document.body.append(canvasElement);

  const composed = await mount(canvasElement);
  await settle();

  const opener = OVERLAYS[slug];
  const opened = opener
    ? await openOverlay(canvasElement, slug, opener)
    : false;

  const tree = { ...readTree(slug), opened };

  // A composed story queues its unmount; the next `load` runs it.
  await composed.load();
  canvasElement.remove();
  await waitFor(() => expect(document.querySelector('[data-slot]')).toBeNull());
  pageElements.forEach((element, index) => {
    for (const { name } of [...element.attributes])
      element.removeAttribute(name);
    for (const [name, value] of pageAttributes[index]!)
      element.setAttribute(name, value);
  });

  return tree;
}

describe('rendered docs stories', () => {
  it('reads one story file per shared component in each framework', () => {
    const count = (modules: Record<string, unknown>, slug: string) =>
      Object.keys(modules).filter((file) => slugOf(file) === slug).length;
    const unread = shared.filter(
      (slug) => count(reactModules, slug) !== 1 || count(vueModules, slug) !== 1
    );
    expect(unread).toEqual([]);
  });

  it('allows only rendered differences that belong to a shared component', () => {
    const unowned = [
      ...Object.keys(renderedDifferences),
      ...Object.keys(renderedAttributeDifferences).map(
        (entry) => entry.split(' ')[0]!
      ),
    ].filter((slot) => !shared.some((slug) => isOwnSlot(slot, slug)));
    expect(unowned).toEqual([]);
  });

  it.each(shared)(
    '%s renders the same parts in React and Vue',
    async (slug) => {
      const react = await load(reactModules, slug);
      const vue = await load(vueModules, slug);
      const vueStories = new Map(docsStories(vue));
      const skipped = new Set<string>();
      const differing = new Set<string>();
      let opened = false;

      for (const [name, story] of docsStories(react)) {
        const vueStory = vueStories.get(name);
        if (!vueStory)
          throw new Error(`${slug}/${name} has no Vue docs story.`);

        const reactTree = await renderTree(
          (canvasElement) => mountReact(react, name, story, canvasElement),
          slug
        );
        const vueTree = await renderTree(
          (canvasElement) => mountVue(vue, name, vueStory, canvasElement),
          slug
        );
        opened ||= reactTree.opened && vueTree.opened;
        for (const slot of [...reactTree.skipped, ...vueTree.skipped]) {
          skipped.add(slot);
        }
        const reactValues = new Map(reactTree.leftOut);
        for (const [entry, value] of vueTree.leftOut) {
          if (reactValues.has(entry) && reactValues.get(entry) !== value) {
            differing.add(entry);
          }
        }

        expect(
          reactTree.tree.length,
          `${slug}/${name} renders no ${slug} part`
        ).toBeGreaterThan(0);
        expect(vueTree.tree, `${slug}/${name}`).toEqual(reactTree.tree);
      }

      if (slug in OVERLAYS) {
        expect(opened, `no ${slug} docs story opens its content`).toBe(true);
      }

      const stale = Object.keys(renderedDifferences).filter(
        (slot) => isOwnSlot(slot, slug) && !skipped.has(slot)
      );
      expect(stale, 'rendered differences that no longer render').toEqual([]);

      const agreeing = Object.keys(renderedAttributeDifferences).filter(
        (entry) =>
          isOwnSlot(entry.split(' ')[0]!, slug) && !differing.has(entry)
      );
      expect(agreeing, 'attribute differences that no longer differ').toEqual(
        []
      );
    },
    60_000
  );
});
