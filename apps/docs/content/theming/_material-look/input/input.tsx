import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const controlVariants = cva('nx:relative nx:flex nx:w-full nx:items-center', {
  variants: {
    variant: {
      outlined: 'nx:rounded-md',
      filled:
        'nx:rounded-t-md nx:bg-control-background nx:transition-field nx:hover:bg-control-background-hover nx:has-[:disabled]:bg-disabled',
    },
  },
});

const inputVariants = cva(
  [
    'nx:peer nx:box-border nx:w-full nx:min-w-0 nx:border-0 nx:bg-transparent nx:outline-none',
    'nx:typography-body-default nx:text-[length:var(--nx-typography-size-base)] nx:leading-[1.4375] nx:text-foreground',
    'nx:autofill-bg-transparent nx:autofill-text-foreground',
    'nx:placeholder:text-muted-foreground-subtle',
    'nx:disabled:cursor-not-allowed nx:disabled:text-disabled-foreground nx:disabled:autofill-text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        outlined: 'nx:rounded-md nx:px-3.5 nx:py-0',
        filled: 'nx:rounded-t-md nx:px-3',
      },
      size: { default: '', sm: '' },
    },
    compoundVariants: [
      { variant: 'outlined', size: 'default', className: 'nx:min-h-14' },
      { variant: 'outlined', size: 'sm', className: 'nx:min-h-10' },
      {
        variant: 'filled',
        size: 'default',
        className: 'nx:min-h-14 nx:pt-[25px] nx:pb-2',
      },
      {
        variant: 'filled',
        size: 'sm',
        className: 'nx:min-h-12 nx:pt-5 nx:pb-1',
      },
    ],
  }
);

// The label rests on the input's text line. It moves up and shrinks while the
// input has focus or a value, which the blank placeholder lets CSS see.
const labelVariants = cva(
  [
    'nx:pointer-events-none nx:absolute nx:top-1/2 nx:-translate-y-1/2',
    'nx:typography-body-default nx:text-[length:var(--nx-typography-size-base)] nx:leading-[1.4375] nx:text-muted-foreground',
    'nx:transition-[top,translate,scale,color] nx:duration-200 nx:ease-out',
    'nx:peer-focus:text-primary-subtle-foreground',
    'nx:peer-aria-invalid:text-error-subtle-foreground nx:peer-focus:peer-aria-invalid:text-error-subtle-foreground',
    'nx:peer-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        outlined: 'nx:left-3.5 nx:origin-left',
        filled: 'nx:left-3 nx:origin-top-left',
      },
      size: { default: '', sm: '' },
      raised: { true: 'nx:scale-75', false: '' },
    },
    compoundVariants: [
      { variant: 'outlined', raised: true, className: 'nx:top-0' },
      {
        variant: 'outlined',
        raised: false,
        className:
          'nx:peer-[:is(:focus,:not(:placeholder-shown))]:top-0 nx:peer-[:is(:focus,:not(:placeholder-shown))]:scale-75',
      },
      {
        variant: 'filled',
        size: 'default',
        raised: true,
        className: 'nx:top-[7px] nx:translate-y-0',
      },
      {
        variant: 'filled',
        size: 'sm',
        raised: true,
        className: 'nx:top-1 nx:translate-y-0',
      },
      {
        variant: 'filled',
        size: 'default',
        raised: false,
        className:
          'nx:peer-[:is(:focus,:not(:placeholder-shown))]:top-[7px] nx:peer-[:is(:focus,:not(:placeholder-shown))]:translate-y-0 nx:peer-[:is(:focus,:not(:placeholder-shown))]:scale-75',
      },
      {
        variant: 'filled',
        size: 'sm',
        raised: false,
        className:
          'nx:peer-[:is(:focus,:not(:placeholder-shown))]:top-1 nx:peer-[:is(:focus,:not(:placeholder-shown))]:translate-y-0 nx:peer-[:is(:focus,:not(:placeholder-shown))]:scale-75',
      },
    ],
  }
);

// The outline is a fieldset so its legend can open a gap in the top border,
// exactly as wide as the raised label.
const outlineVariants = cva(
  [
    'nx:pointer-events-none nx:absolute nx:inset-x-0 nx:-top-[5px] nx:bottom-0 nx:m-0 nx:min-w-0 nx:overflow-hidden nx:px-2 nx:py-0 nx:text-left',
    'nx:rounded-[inherit] nx:border-default nx:border-border-default nx:transition-[border-color] nx:duration-200',
    'nx:peer-hover:border-foreground',
    'nx:peer-focus:border-thick nx:peer-focus:border-focus-default',
    'nx:peer-aria-invalid:border-border-error-active nx:peer-focus:peer-aria-invalid:border-focus-error',
    'nx:peer-disabled:border-border-disabled',
    'nx:*:invisible nx:*:float-none nx:*:block nx:*:h-[11px] nx:*:w-auto nx:*:overflow-hidden nx:*:p-0 nx:*:whitespace-nowrap',
    'nx:*:text-[length:calc(var(--nx-typography-size-base)*0.75)] nx:*:transition-[max-width] nx:*:duration-100',
  ],
  {
    variants: {
      raised: {
        true: 'nx:*:max-w-full',
        false:
          'nx:*:max-w-[0.01px] nx:peer-[:is(:focus,:not(:placeholder-shown))]:*:max-w-full',
      },
    },
  }
);

// The resting line, and over it the focus line that grows from the middle.
const underlineClass = [
  'nx:pointer-events-none nx:absolute nx:inset-x-0 nx:bottom-0 nx:border-width-b-default nx:border-muted-foreground-subtle',
  'nx:peer-hover:border-foreground nx:peer-disabled:border-border-disabled',
  'nx:peer-aria-invalid:border-border-error-active',
  'nx:after:absolute nx:after:inset-x-0 nx:after:-bottom-px nx:after:scale-x-0 nx:after:border-width-b-thick nx:after:border-focus-default nx:after:transition-[scale] nx:after:duration-200 nx:after:ease-out',
  'nx:peer-focus:after:scale-x-100 nx:peer-aria-invalid:after:border-focus-error',
].join(' ');

const helperVariants = cva(
  'nx:m-0 nx:mt-[3px] nx:typography-body-small nx:leading-[1.66] nx:tracking-[var(--nx-typography-letterspacing-wide)]',
  {
    variants: {
      variant: { outlined: 'nx:mx-3.5', filled: 'nx:mx-3' },
      tone: {
        default: 'nx:text-muted-foreground',
        invalid: 'nx:text-error-subtle-foreground',
        disabled: 'nx:text-disabled-foreground',
      },
    },
  }
);

type InputProps = Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants> & {
    /**
     * The field's name. It sits inside the field, and moves to the top edge
     * while the field has focus or a value.
     */
    label?: React.ReactNode;

    /** A hint or an error message under the field. */
    helperText?: React.ReactNode;
  };

/**
 * A one-line text field with its label inside it. Accepts every native input
 * attribute.
 *
 * - `outlined` has a stroke, which opens around the raised label.
 * - `filled` has a tonal fill and a bottom line.
 *
 * With a `placeholder`, the label stays raised so the two never overlap.
 */
function Input({
  className,
  label,
  helperText,
  variant: variantProp,
  size: sizeProp,
  id,
  placeholder,
  disabled,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  ...props
}: InputProps) {
  const variant = variantProp ?? 'outlined';
  const size = sizeProp ?? 'default';
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const raised = Boolean(placeholder);
  const invalid = ariaInvalid === true || ariaInvalid === 'true';

  let tone: 'default' | 'invalid' | 'disabled' = 'default';
  if (invalid) tone = 'invalid';
  if (disabled) tone = 'disabled';

  return (
    <div
      data-slot="input-root"
      data-variant={variant}
      data-size={size}
      className={cn('nx:inline-flex nx:w-full nx:flex-col', className)}
    >
      <div data-slot="input-control" className={controlVariants({ variant })}>
        <input
          id={inputId}
          data-slot="input"
          placeholder={placeholder ?? ' '}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-describedby={
            [ariaDescribedBy, helperText ? helperId : undefined]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={inputVariants({ variant, size })}
          {...props}
        />
        {label ? (
          <label
            htmlFor={inputId}
            data-slot="input-label"
            className={cn(labelVariants({ variant, size, raised }))}
          >
            {label}
          </label>
        ) : null}
        {variant === 'outlined' ? (
          <fieldset
            aria-hidden="true"
            data-slot="input-outline"
            className={outlineVariants({ raised })}
          >
            <legend>
              {label ? (
                <span className="nx:visible nx:inline-block nx:px-[5px] nx:opacity-0">
                  {label}
                </span>
              ) : null}
            </legend>
          </fieldset>
        ) : (
          <span
            aria-hidden="true"
            data-slot="input-underline"
            className={underlineClass}
          />
        )}
      </div>
      {helperText ? (
        <p
          id={helperId}
          data-slot="input-helper"
          className={helperVariants({ variant, tone })}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export { Input, type InputProps, inputVariants };
