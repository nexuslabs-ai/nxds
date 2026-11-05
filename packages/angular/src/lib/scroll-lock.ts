import { DOCUMENT } from '@angular/common';
import { DestroyRef, inject, Injectable } from '@angular/core';

/**
 * Stops the page scrolling while any overlay holds it. One per app root, so
 * every overlay shares its count.
 */
@Injectable({ providedIn: 'root' })
export class PageScrollLock {
  private readonly document = inject(DOCUMENT);
  private holds = 0;
  private restore = () => {};

  /**
   * Locks the page until every hold is released. The body takes the
   * scrollbar's width as padding, so the page doesn't shift.
   * @returns A function that releases this hold.
   */
  hold(): () => void {
    if (this.holds++ === 0) this.lock();
    return () => {
      if (--this.holds === 0) this.restore();
    };
  }

  private lock() {
    const { body, documentElement, defaultView } = this.document;
    const { overflow, paddingRight } = body.style;
    const scrollbar =
      (defaultView?.innerWidth ?? 0) - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    this.restore = () => {
      body.style.overflow = overflow;
      body.style.paddingRight = paddingRight;
    };
  }
}

/**
 * Holds the page scroll lock until the caller is destroyed. Call it in an
 * injection context, such as the constructor of an overlay's panel.
 */
export function lockPageScroll(): void {
  inject(DestroyRef).onDestroy(inject(PageScrollLock).hold());
}
