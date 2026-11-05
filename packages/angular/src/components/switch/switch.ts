import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ClassValue } from 'clsx';

import { cn } from '../../lib/utils';

const switchVariants = cva(
  [
    'nx:peer nx:inline-flex nx:shrink-0 nx:cursor-pointer nx:items-center nx:p-0',
    'nx:rounded-full nx:border-thick nx:border-border-default',
    'nx:transition-control',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error',
    'nx:aria-invalid:data-[state=checked]:border-primary-background',
    'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled',
    'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background nx:enabled:data-[state=checked]:hover:bg-primary-background-hover nx:data-[state=checked]:disabled:border-primary-disabled nx:data-[state=checked]:disabled:bg-primary-disabled',
    'nx:data-[state=unchecked]:bg-control-background nx:enabled:data-[state=unchecked]:hover:bg-control-background-hover nx:data-[state=unchecked]:disabled:bg-disabled',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-5 nx:w-9',
        sm: 'nx:h-[18px] nx:w-[32px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const switchThumbVariants = cva(
  [
    'nx:pointer-events-none nx:block nx:rounded-full',
    'nx:bg-control-thumb nx:transition-[background-color,transform]',
    'nx:data-[state=checked]:bg-primary-foreground',
    'nx:data-[state=unchecked]:translate-x-0',
  ],
  {
    variants: {
      size: {
        default: 'nx:size-4 nx:data-[state=checked]:translate-x-4',
        sm: 'nx:size-[14px] nx:data-[state=checked]:translate-x-[14px]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type SwitchSize = NonNullable<VariantProps<typeof switchVariants>['size']>;

/**
 * On/off control for settings that apply at once, with no save step. Put it on
 * a `<button>` and pair it with a label so the label text is clickable too.
 * Bind `[(checked)]`, a Signal Forms field, or `ngModel` / `formControl`.
 */
@Component({
  selector: 'button[nxSwitch]',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NxSwitch),
      multi: true,
    },
  ],
  host: {
    type: 'button',
    role: 'switch',
    'data-slot': 'switch',
    '[attr.data-size]': 'size()',
    '[attr.aria-checked]': 'checked()',
    '[attr.data-state]': 'state()',
    '[attr.data-disabled]': "isDisabled() ? '' : null",
    '[attr.disabled]': "isDisabled() ? '' : null",
    '[class]': 'classes()',
    '(click)': 'toggle()',
    '(blur)': 'onTouched()',
  },
  template: `<span
    data-slot="switch-thumb"
    [attr.data-state]="state()"
    [attr.data-disabled]="isDisabled() ? '' : null"
    [class]="thumbClasses()"
    ><ng-content
  /></span>`,
})
export class NxSwitch implements ControlValueAccessor {
  /** Whether the switch is on. Bind `[(checked)]` to follow it. */
  readonly checked = model(false);
  /** Stops the switch from turning on or off. */
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly size = input<SwitchSize>('default');
  readonly userClass = input<ClassValue>('', { alias: 'class' });

  private readonly formDisabled = signal(false);
  private onChange: (checked: boolean) => void = () => {};
  protected onTouched: () => void = () => {};

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled()
  );
  protected readonly state = computed(() =>
    this.checked() ? 'checked' : 'unchecked'
  );
  protected readonly classes = computed(() =>
    cn(switchVariants({ size: this.size() }), this.userClass())
  );
  protected readonly thumbClasses = computed(() =>
    switchThumbVariants({ size: this.size() })
  );

  protected toggle() {
    const next = !this.checked();
    this.checked.set(next);
    this.onChange(next);
  }

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (checked: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}

export { switchVariants };
