import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject } from '@angular/core';

let openPanels = 0;
let unlockPageScroll = () => {};

/**
 * Stops the page scrolling behind an open overlay until the last one closes.
 * The body takes the scrollbar's width as padding, so the page doesn't shift.
 * Call it from the constructor of an overlay's panel.
 */
export function lockPageScroll(): void {
  const { body, documentElement, defaultView } = inject(DOCUMENT);
  if (openPanels++ === 0) {
    const { overflow, paddingRight } = body.style;
    const scrollbar =
      (defaultView?.innerWidth ?? 0) - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    unlockPageScroll = () => {
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
    };
  }
  inject(DestroyRef).onDestroy(() => {
    if (--openPanels === 0) unlockPageScroll();
  });
}
