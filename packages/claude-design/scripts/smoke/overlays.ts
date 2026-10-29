import { fail, LIGHT, openPage } from './harness.ts';

/** Overlays that must open from their trigger, close on Escape and return focus. */
export const OVERLAYS: {
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

export async function checkOverlays() {
  for (const overlay of OVERLAYS) await checkOverlay(overlay);
}
