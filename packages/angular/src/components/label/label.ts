import { computed, Directive, input } from '@angular/core';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/utils';

/**
 * Accessible name for a form control, linked by setting `for` to the control's
 * `id`. Dims when an earlier sibling with the `nx:peer` class is disabled.
 */
@Directive({
  selector: 'label[nxLabel]',
  host: {
    'data-slot': 'label',
    '[class]': 'classes()',
    '(mousedown)': 'preventTextSelection($event)',
  },
})
export class NxLabel {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:flex nx:items-center nx:gap-2 nx:select-none nx:typography-label-default nx:text-foreground',
      'nx:peer-disabled:cursor-not-allowed nx:peer-disabled:text-disabled-foreground',
      this.userClass()
    )
  );

  /** A double click on the label selects no text, unless it lands in a control. */
  protected preventTextSelection(event: MouseEvent) {
    const target = event.target as Element;
    if (target.closest('button, input, select, textarea')) return;
    if (event.detail > 1) event.preventDefault();
  }
}
