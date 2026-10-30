import { expect, type within } from 'storybook/test';

const DEFAULT_CONTROL_SELECTOR =
  'button, input, [role="combobox"], [role="tab"]';

type Canvas = ReturnType<typeof within>;

/**
 * Pixel-rounded height of the single focusable control inside a host element
 * identified by `data-testid`. If the host element itself matches the selector
 * (e.g. `data-testid` placed directly on a `<button>`), measures the host;
 * otherwise looks for a single descendant match.
 */
export function getControlHeight(
  canvas: Canvas,
  testId: string,
  selector = DEFAULT_CONTROL_SELECTOR
): number {
  const host: HTMLElement = canvas.getByTestId(testId);
  if (host.matches(selector)) {
    return Math.round(host.getBoundingClientRect().height);
  }

  const controls = host.querySelectorAll<HTMLElement>(selector);
  if (controls.length > 1) {
    throw new Error(
      `Found ${controls.length} controls matching \`${selector}\` inside [data-testid="${testId}"] — measurement is ambiguous`
    );
  }

  const control = controls[0];
  if (!control) {
    throw new Error(
      `No control matching \`${selector}\` found inside [data-testid="${testId}"]`
    );
  }

  return Math.round(control.getBoundingClientRect().height);
}

type HeightMeasurementOptions = {
  selector?: string;
};

export async function expectHeightPinned(
  canvas: Canvas,
  testId: string,
  expectedPx: number,
  { selector }: HeightMeasurementOptions = {}
): Promise<void> {
  await document.fonts.ready;
  const actual = getControlHeight(canvas, testId, selector);
  expect(actual).toBe(expectedPx);
}

/** The line height, snapped down to the 1/64px steps that layout uses. */
function lineHeight(element: Element) {
  return Math.floor(parseFloat(getComputedStyle(element).lineHeight) * 64) / 64;
}

/** The height inside the border and padding, with fractions kept. */
function contentHeight(element: Element) {
  const style = getComputedStyle(element);
  const edges = [
    'borderTopWidth',
    'borderBottomWidth',
    'paddingTop',
    'paddingBottom',
  ] as const;
  return edges.reduce(
    (height, edge) => height - parseFloat(style[edge]),
    element.getBoundingClientRect().height
  );
}

/** Checks that a line of `element`'s text fits inside its border and padding. */
export async function expectTextFits(element: Element): Promise<void> {
  await expect(contentHeight(element)).toBeGreaterThanOrEqual(
    lineHeight(element)
  );
}

/** Checks that `part` stays inside the border of `control`. */
export async function expectInsideBorder(
  part: Element,
  control: HTMLElement
): Promise<void> {
  const mark = part.getBoundingClientRect();
  const box = control.getBoundingClientRect();
  const top = box.top + control.clientTop;
  const left = box.left + control.clientLeft;
  await expect(mark.top).toBeGreaterThanOrEqual(top);
  await expect(mark.bottom).toBeLessThanOrEqual(top + control.clientHeight);
  await expect(mark.left).toBeGreaterThanOrEqual(left);
  await expect(mark.right).toBeLessThanOrEqual(left + control.clientWidth);
}
