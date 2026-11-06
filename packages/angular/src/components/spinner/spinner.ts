import { computed, Directive, input } from '@angular/core';
import type { ClassValue } from 'clsx';

import { drawIcon } from '../../lib/icon';
import { IconLoader2 } from '../../lib/icons';
import { cn } from '../../lib/utils';

/**
 * Rotating loading indicator with `role="status"` and a default `aria-label`
 * of "Loading". Size it with `nx:size-*` and color it with `nx:text-*`.
 */
@Directive({
  selector: 'svg[nxSpinner]',
  host: {
    role: 'status',
    'aria-label': 'Loading',
    'data-slot': 'spinner',
    '[class]': 'classes()',
    '[innerHTML]': 'shapes()',
  },
})
export class NxSpinner {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn('nx:size-4 nx:animate-spin', this.userClass())
  );
  protected readonly shapes = drawIcon(() => IconLoader2);
}
