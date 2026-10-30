import type { Page } from 'playwright';

import {
  el,
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  x,
} from './harness.ts';

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
export const WRAPPED_CASES: { name: string; markup: string; reads: Read[] }[] =
  [
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
              x('Icons.CaretDownIcon')
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
        x('InputGroupAddon', '', x('Icons.MagnifyingGlassIcon')),
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
        x('AlertIcon', '', x('Icons.InfoIcon')),
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
                  x('Icons.TrayIcon'),
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
        el(
          'div',
          'class="card-header"',
          x('Button', 'variant="outline"', 'Edit')
        )
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
          x(
            'ChoiceCardContent',
            '',
            x('ChoiceCardTitle', '', 'Product updates')
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

export async function checkWrapped() {
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
