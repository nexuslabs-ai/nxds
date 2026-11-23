import { expect } from 'storybook/test';

/** Checks `element`'s four corner radii, top-left first, then clockwise. */
export async function expectCorners(
  element: Element,
  expected: readonly string[]
): Promise<void> {
  const style = getComputedStyle(element);
  await expect([
    style.borderTopLeftRadius,
    style.borderTopRightRadius,
    style.borderBottomRightRadius,
    style.borderBottomLeftRadius,
  ]).toEqual(expected);
}
