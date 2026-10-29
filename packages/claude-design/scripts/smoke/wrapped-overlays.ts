import {
  fail,
  failOnProblems,
  LIGHT,
  openPage,
  type PageGlobals,
  x,
} from './harness.ts';

/** Overlays mounted as separate x-imports, opened from an `as-child` Button. */
const trigger = (name: string, label: string) =>
  x(name, 'as-child', x('Button', 'variant="outline"', label));

export const WRAPPED_OVERLAYS: {
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

export async function checkWrappedOverlays() {
  for (const overlay of WRAPPED_OVERLAYS) await checkWrappedOverlay(overlay);
}
