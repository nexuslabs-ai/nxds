import { computed, Directive, input } from '@angular/core';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/utils';

/**
 * Groups related content and actions in a bordered section.
 * Content is clipped to the rounded corners. Add `nx:overflow-visible` for content that overhangs the edge.
 */
@Directive({
  selector: '[nxCard]',
  host: { 'data-slot': 'card', '[class]': 'classes()' },
})
export class NxCard {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:overflow-hidden nx:rounded-xl nx:border-width-default nx:border-color-default nx:bg-container nx:text-container-foreground nx:shadow-sm',
      this.userClass()
    )
  );
}

/**
 * Holds the title, description and `nxCardAction`.
 * `nxCardAction` sits in a right-hand column. Add `nx:col-start-1` to a custom child so it lines up with the title.
 */
@Directive({
  selector: '[nxCardHeader]',
  host: { 'data-slot': 'card-header', '[class]': 'classes()' },
})
export class NxCardHeader {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:grid nx:grid-cols-[minmax(0,1fr)_auto] nx:items-start nx:gap-y-1.5 nx:p-6',
      this.userClass()
    )
  );
}

/**
 * Card heading. Put it on an `h3`, or on another heading level.
 */
@Directive({
  selector: '[nxCardTitle]',
  host: { 'data-slot': 'card-title', '[class]': 'classes()' },
})
export class NxCardTitle {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:col-start-1 nx:m-0 nx:min-w-0 nx:typography-heading-xsmall',
      this.userClass()
    )
  );
}

/**
 * Supporting text under the title.
 */
@Directive({
  selector: '[nxCardDescription]',
  host: { 'data-slot': 'card-description', '[class]': 'classes()' },
})
export class NxCardDescription {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:col-start-1 nx:m-0 nx:min-w-0 nx:typography-body-default nx:text-muted-foreground',
      this.userClass()
    )
  );
}

/**
 * Holds header actions, such as buttons or badges, beside the title.
 */
@Directive({
  selector: '[nxCardAction]',
  host: { 'data-slot': 'card-action', '[class]': 'classes()' },
})
export class NxCardAction {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:col-start-2 nx:row-start-1 nx:row-span-2 nx:flex nx:items-center nx:gap-2 nx:self-start nx:justify-self-end nx:pl-4',
      this.userClass()
    )
  );
}

/**
 * Main content area.
 */
@Directive({
  selector: '[nxCardContent]',
  host: { 'data-slot': 'card-content', '[class]': 'classes()' },
})
export class NxCardContent {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn('nx:p-6 nx:pt-0', this.userClass())
  );
}

/**
 * Holds actions and content at the bottom of the card.
 */
@Directive({
  selector: '[nxCardFooter]',
  host: { 'data-slot': 'card-footer', '[class]': 'classes()' },
})
export class NxCardFooter {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn('nx:flex nx:items-center nx:gap-2 nx:p-6 nx:pt-0', this.userClass())
  );
}
