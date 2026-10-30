/**
 * Where an anchor jump to `element` lands below the viewport top: the page's
 * `scroll-padding-top`, clear of the sticky header, plus the element's own
 * `scroll-margin-top`.
 */
export function getScrollOffset(element: Element): number {
  const padding = parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop
  );
  const margin = parseFloat(getComputedStyle(element).scrollMarginTop);
  return (padding || 0) + (margin || 0);
}
