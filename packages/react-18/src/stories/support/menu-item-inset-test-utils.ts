import { DENSITY_OPTIONS, UI_SCALE_OPTIONS } from '@nxds/core';
import { expect } from 'storybook/test';

function textInset(element: Element) {
  return parseFloat(getComputedStyle(element).paddingLeft);
}

function width(element: Element) {
  return parseFloat(getComputedStyle(element).width);
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

/**
 * Checks, at every UI scale set on `menu`, that a radio `dot` keeps 4px on
 * each side inside `indicator`, the box the default icon fills.
 */
export async function expectRadioDotInsetAtEveryUiScale(
  menu: HTMLElement,
  indicator: HTMLElement,
  dot: Element
): Promise<void> {
  for (const { value } of UI_SCALE_OPTIONS) {
    menu.setAttribute('data-ui-scale', value);
    await expect(width(indicator) - width(dot)).toBe(8);
  }
}
