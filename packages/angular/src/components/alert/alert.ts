import {
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { NxIcon } from '../../lib/icon';
import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';

const alertVariants = cva('nx:group/alert nx:grid nx:w-full nx:px-6 nx:py-4', {
  variants: {
    variant: {
      default: 'nx:border-border-default nx:bg-container nx:text-foreground',
      destructive:
        'nx:border-error-border nx:bg-error-subtle nx:text-error-subtle-foreground',
      success:
        'nx:border-success-border nx:bg-success-subtle nx:text-success-subtle-foreground',
      information:
        'nx:border-information-border nx:bg-information-subtle nx:text-information-subtle-foreground',
      warning:
        'nx:border-warning-border nx:bg-warning-subtle nx:text-warning-subtle-foreground',
    },
    presentation: {
      card: 'nx:rounded-md nx:border-default',
      banner: 'nx:rounded-none nx:border-b-default',
    },
    layout: {
      stack:
        'nx:grid-cols-[auto_minmax(0,1fr)] nx:items-start nx:has-[>[data-slot=alert-icon]]:gap-x-4 nx:*:data-[slot=alert-title]:col-start-2 nx:*:data-[slot=alert-description]:col-start-2 nx:*:data-[slot=alert-content]:col-start-2 nx:*:data-[slot=alert-actions]:col-start-2',
      inline:
        'nx:grid-cols-[minmax(0,1fr)_auto] nx:items-center nx:gap-x-4 nx:gap-y-1 nx:has-[>[data-slot=alert-icon]]:grid-cols-[auto_minmax(0,1fr)_auto]',
    },
  },
  defaultVariants: {
    variant: 'default',
    presentation: 'card',
    layout: 'stack',
  },
});

type AlertVariants = VariantProps<typeof alertVariants>;

/**
 * Shows a status message inside the page.
 * Set `presentation="banner"` for an edge-to-edge strip with a bottom border only.
 * For trailing controls, use `layout="inline"` with `nxAlertContent` and `nxAlertActions`.
 * In the default stack layout, use Button actions only and leave out `nxAlertClose`.
 * Alert has no live role by default. Pass `role="alert"` for urgent messages or `role="status"` for polite updates.
 */
@Directive({
  selector: '[nxAlert]',
  host: {
    'data-slot': 'alert',
    '[attr.data-variant]': 'variant()',
    '[attr.data-presentation]': 'presentation()',
    '[attr.data-layout]': 'layout()',
    '[class]': 'classes()',
  },
})
export class NxAlert {
  readonly variant = input<NonNullable<AlertVariants['variant']>>('default');
  readonly presentation =
    input<NonNullable<AlertVariants['presentation']>>('card');
  readonly layout = input<NonNullable<AlertVariants['layout']>>('stack');
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      alertVariants({
        variant: this.variant(),
        presentation: this.presentation(),
        layout: this.layout(),
      }),
      this.userClass()
    )
  );
}

/**
 * Leading icon. Place it first in `nxAlert` and put any icon inside it.
 * Sizes the icon, colors it to match `variant` and hides it from screen readers.
 */
@Directive({
  selector: '[nxAlertIcon]',
  host: {
    'aria-hidden': 'true',
    'data-slot': 'alert-icon',
    '[class]': 'classes()',
  },
})
export class NxAlertIcon {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:flex nx:[&>svg]:size-4',
      'nx:group-data-[layout=stack]/alert:translate-y-0.5',
      this.userClass()
    )
  );
}

/**
 * Wraps the title and description. Required with `layout="inline"` so the text sits beside `nxAlertActions`.
 */
@Directive({
  selector: '[nxAlertContent]',
  host: { 'data-slot': 'alert-content', '[class]': 'classes()' },
})
export class NxAlertContent {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn('nx:flex nx:min-w-0 nx:flex-col', this.userClass())
  );
}

/**
 * Alert heading. Put it on a `div`, or on a real heading.
 */
@Directive({
  selector: '[nxAlertTitle]',
  host: { 'data-slot': 'alert-title', '[class]': 'classes()' },
})
export class NxAlertTitle {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:mt-0 nx:mb-1 nx:last:mb-0 nx:typography-label-default',
      this.userClass()
    )
  );
}

/**
 * Body text of an alert. Holds one or more paragraphs.
 */
@Directive({
  selector: '[nxAlertDescription]',
  host: { 'data-slot': 'alert-description', '[class]': 'classes()' },
})
export class NxAlertDescription {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:typography-body-default nx:group-data-[variant=default]/alert:text-muted-foreground',
      this.userClass()
    )
  );
}

/**
 * Holds one or two `nxButton` actions. Add `nxAlertClose` here only with `layout="inline"`.
 */
@Directive({
  selector: '[nxAlertActions]',
  host: { 'data-slot': 'alert-actions', '[class]': 'classes()' },
})
export class NxAlertActions {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      'nx:mt-3 nx:flex nx:flex-wrap nx:items-center nx:gap-2',
      'nx:group-data-[layout=inline]/alert:mt-0 nx:group-data-[layout=inline]/alert:self-center',
      this.userClass()
    )
  );
}

/**
 * Close button, labelled "Dismiss alert" by default. It doesn't remove the alert, so remove it in its `(click)` handler.
 * Custom children need their own accessible name, such as `aria-label` on an icon-only child.
 */
@Component({
  selector: 'button[nxAlertClose]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NxIcon],
  host: {
    type: 'button',
    'data-slot': 'alert-close',
    '[class]': 'classes()',
  },
  template: `<ng-content
    ><svg aria-hidden="true" [nxIcon]="iconX"></svg
    ><span class="nx:sr-only">Dismiss alert</span></ng-content
  >`,
})
export class NxAlertClose {
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly iconX = IconX;
  protected readonly classes = computed(() =>
    cn(
      'nx:inline-flex nx:size-8 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-0 nx:bg-transparent nx:p-0 nx:text-muted-foreground',
      'nx:transition-control nx:hover:bg-container-hover nx:hover:text-foreground',
      'nx:focus-visible:bg-container-hover nx:focus-visible:text-foreground',
      'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
      'nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground',
      'nx:[&_svg]:size-4 nx:[&_svg]:shrink-0',
      this.userClass()
    )
  );
}

export { alertVariants };
