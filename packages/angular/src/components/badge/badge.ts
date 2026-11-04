import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  ElementRef,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'nx:inline-flex nx:box-border nx:h-6 nx:w-fit nx:items-center nx:justify-center nx:gap-1 nx:rounded-md nx:border-default nx:border-transparent nx:whitespace-nowrap nx:transition-colors',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
        error: '',
        warning: '',
        success: '',
        information: '',
      },
      fill: {
        solid: '',
        light: '',
        outline: '',
      },
    },
    compoundVariants: [
      // Solid fill variants
      {
        variant: 'default',
        fill: 'solid',
        className: 'nx:bg-primary-background nx:text-primary-foreground',
      },
      {
        variant: 'secondary',
        fill: 'solid',
        className: 'nx:bg-secondary-background nx:text-secondary-foreground',
      },
      {
        variant: 'error',
        fill: 'solid',
        className: 'nx:bg-error-background nx:text-error-foreground',
      },
      {
        variant: 'warning',
        fill: 'solid',
        className: 'nx:bg-warning-background nx:text-warning-foreground',
      },
      {
        variant: 'success',
        fill: 'solid',
        className: 'nx:bg-success-background nx:text-success-foreground',
      },
      {
        variant: 'information',
        fill: 'solid',
        className:
          'nx:bg-information-background nx:text-information-foreground',
      },
      // Light fill variants
      {
        variant: 'default',
        fill: 'light',
        className: 'nx:bg-primary-subtle nx:text-primary-subtle-foreground',
      },
      {
        variant: 'secondary',
        fill: 'light',
        className: 'nx:bg-secondary-subtle nx:text-secondary-subtle-foreground',
      },
      {
        variant: 'error',
        fill: 'light',
        className: 'nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      {
        variant: 'warning',
        fill: 'light',
        className: 'nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      {
        variant: 'success',
        fill: 'light',
        className: 'nx:bg-success-subtle nx:text-success-subtle-foreground',
      },
      {
        variant: 'information',
        fill: 'light',
        className:
          'nx:bg-information-subtle nx:text-information-subtle-foreground',
      },
      // Outline fill variants
      {
        variant: 'default',
        fill: 'outline',
        className:
          'nx:border-primary-border nx:bg-primary-subtle nx:text-primary-subtle-foreground',
      },
      {
        variant: 'secondary',
        fill: 'outline',
        className:
          'nx:border-border-default nx:bg-secondary-subtle nx:text-secondary-subtle-foreground',
      },
      {
        variant: 'error',
        fill: 'outline',
        className:
          'nx:border-error-border nx:bg-error-subtle nx:text-error-subtle-foreground',
      },
      {
        variant: 'warning',
        fill: 'outline',
        className:
          'nx:border-warning-border nx:bg-warning-subtle nx:text-warning-subtle-foreground',
      },
      {
        variant: 'success',
        fill: 'outline',
        className:
          'nx:border-success-border nx:bg-success-subtle nx:text-success-subtle-foreground',
      },
      {
        variant: 'information',
        fill: 'outline',
        className:
          'nx:border-information-border nx:bg-information-subtle nx:text-information-subtle-foreground',
      },
    ],
    defaultVariants: {
      variant: 'default',
      fill: 'solid',
    },
  }
);

const badgeIconClasses =
  'nx:flex nx:items-center nx:justify-center nx:size-3.5 nx:[&>svg]:size-3.5';

function badgeShapeClasses(
  isNumber: boolean,
  isIconOnly: boolean,
  isCaps: boolean
) {
  if (isNumber)
    return 'nx:min-w-6 nx:rounded-full nx:px-1.5 nx:typography-label-caps nx:tabular-nums';
  if (isIconOnly) return 'nx:w-6 nx:p-0';
  if (isCaps) return 'nx:typography-label-caps nx:uppercase nx:px-2';
  return 'nx:typography-label-default nx:px-2.5';
}

type BadgeVariants = VariantProps<typeof badgeVariants>;

/** Icon before the label, sized to 14px. Without a label, it shows alone. */
@Directive({ selector: '[nxBadgeLeftIcon]' })
export class NxBadgeLeftIcon {}

/** Icon after the label, sized to 14px. Without a label or left icon, it shows alone. */
@Directive({ selector: '[nxBadgeRightIcon]' })
export class NxBadgeRightIcon {}

/** Whether `host` holds a label: text, or an element other than the icon wrappers. */
function hasLabel(host: HTMLElement) {
  return [...host.childNodes].some((node) => {
    if (node.nodeType === Node.TEXT_NODE) return !!node.textContent?.trim();
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    return !(node as Element).hasAttribute('data-badge-icon');
  });
}

/** Short status or count label. Put it on a `<span>`. */
@Component({
  selector: 'span[nxBadge]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    'data-slot': 'badge',
    '[attr.data-variant]': 'variant()',
    '[attr.data-fill]': 'fill()',
    '[attr.data-caps]': 'isCaps()',
    '[attr.data-number]': "isNumber() ? 'true' : null",
    '[attr.data-icon-only]': "isIconOnly() ? 'true' : null",
    '[attr.role]': "isIconOnly() ? 'img' : null",
    '[class]': 'classes()',
  },
  template: `
    <ng-template #left><ng-content select="[nxBadgeLeftIcon]" /></ng-template>
    <ng-template #right><ng-content select="[nxBadgeRightIcon]" /></ng-template>
    @if (isIconOnly()) {
      <span data-badge-icon [class]="iconClasses"
        ><ng-container [ngTemplateOutlet]="leftIcon() ? left : right"
      /></span>
    }
    @if (showLeftIcon()) {
      <span data-badge-icon aria-hidden="true" [class]="iconClasses"
        ><ng-container [ngTemplateOutlet]="left"
      /></span>
    }
    <ng-content />
    @if (showRightIcon()) {
      <span data-badge-icon aria-hidden="true" [class]="iconClasses"
        ><ng-container [ngTemplateOutlet]="right"
      /></span>
    }
  `,
})
export class NxBadge {
  readonly variant = input<NonNullable<BadgeVariants['variant']>>('default');
  readonly fill = input<NonNullable<BadgeVariants['fill']>>('solid');
  /** Uppercase text with wider letter spacing. */
  readonly isCaps = input(true, { transform: booleanAttribute });
  /**
   * Renders a round count badge from its content and ignores icons.
   * Add an `aria-label` such as "8 unread", because a bare number lacks context.
   */
  readonly isNumber = input(false, { transform: booleanAttribute });
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  protected readonly leftIcon = contentChild(NxBadgeLeftIcon);
  protected readonly rightIcon = contentChild(NxBadgeRightIcon);
  protected readonly iconClasses = badgeIconClasses;
  private readonly labelled = signal(true);

  protected readonly isIconOnly = computed(
    () =>
      !this.isNumber() &&
      !this.labelled() &&
      Boolean(this.leftIcon() || this.rightIcon())
  );
  protected readonly showLeftIcon = computed(
    () => !!this.leftIcon() && !this.isNumber() && !this.isIconOnly()
  );
  protected readonly showRightIcon = computed(
    () => !!this.rightIcon() && !this.isNumber() && !this.isIconOnly()
  );
  protected readonly classes = computed(() =>
    cn(
      badgeVariants({ variant: this.variant(), fill: this.fill() }),
      badgeShapeClasses(this.isNumber(), this.isIconOnly(), this.isCaps()),
      this.userClass()
    )
  );

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterRenderEffect((onCleanup) => {
      const update = () => this.labelled.set(hasLabel(host));
      update();
      const observer = new MutationObserver(update);
      observer.observe(host, {
        childList: true,
        characterData: true,
        subtree: true,
      });
      onCleanup(() => observer.disconnect());
    });
  }
}

export { badgeVariants };
