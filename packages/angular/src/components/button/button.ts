import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/utils';
import { NX_BUTTON_GROUP_SIZE } from '../button-group/button-group-context';
import { NxSpinner } from '../spinner/spinner';

const buttonVariants = cva(
  'nx:inline-flex nx:box-border nx:cursor-pointer nx:items-center nx:bg-transparent nx:py-0 nx:no-underline nx:justify-center nx:rounded-base nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-[color,background-color,border-color,scale] nx:active:scale-[0.96] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:outline-offset-2 nx:disabled:pointer-events-none nx:disabled:cursor-default nx:disabled:opacity-100 nx:aria-disabled:pointer-events-none nx:aria-disabled:cursor-default nx:aria-disabled:opacity-100 nx:[&_svg]:pointer-events-none nx:[&_svg]:size-3.5 nx:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'nx:bg-primary-background nx:text-primary-foreground nx:hover:bg-primary-background-hover nx:active:bg-primary-background-active nx:disabled:bg-primary-disabled nx:aria-disabled:bg-primary-disabled',
        error:
          'nx:text-error-subtle-foreground nx:hover:bg-error-subtle-hover nx:active:bg-error-subtle-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        destructive:
          'nx:bg-error-background nx:text-error-foreground nx:hover:bg-error-background-hover nx:active:bg-error-background-active nx:disabled:bg-error-disabled nx:aria-disabled:bg-error-disabled',
        outline:
          'nx:border-default nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        dashed:
          'nx:border-default nx:border-dashed nx:border-border-default nx:bg-container nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:border-border-disabled nx:aria-disabled:bg-disabled nx:aria-disabled:text-disabled-foreground',
        secondary:
          'nx:bg-secondary-background nx:text-secondary-foreground nx:hover:bg-secondary-background-hover nx:active:bg-secondary-background-active nx:disabled:bg-secondary-disabled nx:disabled:text-disabled-foreground nx:aria-disabled:bg-secondary-disabled nx:aria-disabled:text-disabled-foreground',
        ghost:
          'nx:text-foreground nx:hover:bg-container-hover nx:active:bg-container-active nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        link: 'nx:border-0 nx:text-primary-subtle-foreground nx:underline-offset-4 nx:hover:underline nx:active:scale-100 nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
      },
      size: {
        sm: 'nx:h-8 nx:px-2.5 nx:gap-2 nx:typography-label-default',
        default: 'nx:h-10 nx:px-3 nx:gap-2 nx:typography-label-default',
        lg: 'nx:h-12 nx:px-3.5 nx:gap-2 nx:typography-label-default',
        'icon-sm': 'nx:size-8 nx:gap-0 nx:p-0',
        icon: 'nx:size-10 nx:gap-0 nx:p-0',
        'icon-lg': 'nx:size-12 nx:gap-0 nx:p-0',
      },
    },
    compoundVariants: [
      {
        variant: 'link',
        size: ['sm', 'default', 'lg'],
        className: 'nx:h-auto nx:p-0!',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ButtonVariants = VariantProps<typeof buttonVariants>;
type ButtonVariant = NonNullable<ButtonVariants['variant']>;
type ButtonSize = NonNullable<ButtonVariants['size']>;

function isIconButtonSize(size: ButtonSize) {
  return size === 'icon-sm' || size === 'icon' || size === 'icon-lg';
}

/** Decorative icon before the label. Use it or `nxButtonEndIcon`, not both. */
@Directive({ selector: '[nxButtonStartIcon]' })
export class NxButtonStartIcon {}

/** Decorative icon after the label. Use it or `nxButtonStartIcon`, not both. */
@Directive({ selector: '[nxButtonEndIcon]' })
export class NxButtonEndIcon {}

/**
 * Triggers an action. Put it on a `<button>`, or on an `<a>` for a link that
 * looks like a button. A link ignores `disabled`, so Button sets
 * `aria-disabled` and removes it from the tab order.
 */
@Component({
  selector: 'button[nxButton], a[nxButton]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, NxSpinner],
  host: {
    'data-slot': 'button',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'semanticSize()',
    '[attr.data-icon-only]': "iconOnly() ? 'true' : null",
    '[attr.data-loading]': "loading() ? 'true' : null",
    '[attr.aria-busy]': "loading() ? 'true' : null",
    '[attr.aria-disabled]': "isDisabled() ? 'true' : null",
    '[attr.type]': 'isNativeButton ? type() : null',
    '[attr.disabled]': "isNativeButton && isDisabled() ? '' : null",
    '[attr.tabindex]': '!isNativeButton && isDisabled() ? -1 : null',
    '[class]': 'classes()',
  },
  template: `
    <ng-template #label><ng-content /></ng-template>
    @if (loading()) {
      <span
        data-slot="button-loading-content"
        class="nx:relative nx:inline-flex nx:items-center nx:justify-center"
        ><span data-slot="button-loading-label" class="nx:opacity-0"
          ><ng-container [ngTemplateOutlet]="label" /></span
        ><svg
          nxSpinner
          aria-hidden="true"
          class="nx:absolute nx:left-1/2 nx:top-1/2 nx:-translate-x-1/2 nx:-translate-y-1/2"
        ></svg
      ></span>
    } @else {
      @if (startIcon()) {
        <span
          aria-hidden="true"
          data-slot="button-start-icon"
          class="nx:inline-flex nx:shrink-0"
          ><ng-content select="[nxButtonStartIcon]"
        /></span>
      }
      <ng-container [ngTemplateOutlet]="label" />
      @if (endIcon()) {
        <span
          aria-hidden="true"
          data-slot="button-end-icon"
          class="nx:inline-flex nx:shrink-0"
          ><ng-content select="[nxButtonEndIcon]"
        /></span>
      }
    }
  `,
})
export class NxButton {
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<ButtonSize>();
  /** Disables the button and shows a spinner in place of its content. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  private readonly groupSize = inject(NX_BUTTON_GROUP_SIZE, { optional: true });
  protected readonly isNativeButton =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.tagName ===
    'BUTTON';
  protected readonly startIcon = contentChild(NxButtonStartIcon);
  protected readonly endIcon = contentChild(NxButtonEndIcon);

  protected readonly semanticSize = computed(
    () => this.size() ?? this.groupSize?.() ?? 'default'
  );
  protected readonly isDisabled = computed(
    () => this.disabled() || this.loading()
  );
  protected readonly iconOnly = computed(() =>
    isIconButtonSize(this.semanticSize())
  );
  protected readonly classes = computed(() =>
    cn(
      buttonVariants({ variant: this.variant(), size: this.semanticSize() }),
      this.userClass()
    )
  );
}

export { buttonVariants };
