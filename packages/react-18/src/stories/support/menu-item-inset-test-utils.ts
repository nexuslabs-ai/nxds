import { DENSITY_OPTIONS } from '@nxds/core';
import { expect } from 'storybook/test';

function textInset(element: Element) {
  return parseFloat(getComputedStyle(element).paddingLeft);
}

/**
 * Checks, at every density set on `menu`, that `check` sits 8px into `item`
 * and the item's text starts 8px after it. Each `aligned` element's text must
 * start at the same place.
 */
export async function expectMenuItemInsetAtEveryDensity(
  menu: HTMLElement,
  item: HTMLElement,
  check: HTMLElement,
  aligned: HTMLElement[] = []
): Promise<void> {
  for (const { value } of DENSITY_OPTIONS) {
    menu.setAttribute('data-density', value);
    await expect(check.offsetLeft).toBe(8);
    await expect(textInset(item) - check.offsetLeft - check.offsetWidth).toBe(
      8
    );
    for (const element of aligned) {
      await expect(textInset(element)).toBe(textInset(item));
    }
  }
}
