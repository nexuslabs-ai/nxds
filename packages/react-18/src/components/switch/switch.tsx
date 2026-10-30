import * as React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const switchVariants = cva(
  [
    'nx:peer nx:relative nx:inline-flex nx:shrink-0 nx:cursor-pointer nx:items-center nx:p-0',
    'nx:before:absolute nx:before:inset-x-0 nx:before:top-1/2 nx:before:h-[24px] nx:before:-translate-y-1/2',
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
        default:
          'nx:h-[calc(var(--nx-icon-glyph-default)_+_4px)] nx:w-[calc(var(--nx-icon-glyph-default)*2_+_4px)]',
        sm: 'nx:h-[calc(var(--nx-icon-glyph-sm)_+_4px)] nx:w-[calc(var(--nx-icon-glyph-sm)*2_+_4px)]',
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
        default:
          'nx:size-[calc(var(--nx-icon-glyph-default)_+_4px_-_2*var(--nx-borderwidth-thick))] nx:data-[state=checked]:translate-x-(--nx-icon-glyph-default)',
        sm: 'nx:size-[calc(var(--nx-icon-glyph-sm)_+_4px_-_2*var(--nx-borderwidth-thick))] nx:data-[state=checked]:translate-x-(--nx-icon-glyph-sm)',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

/**
 * Props for Switch.
 */
type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

/**
 * On/off control for settings that apply at once, with no save step. Pair it
 * with a label so the label text is clickable too.
 */
const Switch = React.forwardRef<
  HTMLButtonElement,
  React.PropsWithoutRef<SwitchProps>
>(function Switch(propsWithoutRef, forwardedRef) {
  const {
    className,
    size,
    ...props
  }: React.PropsWithoutRef<SwitchProps> & {
    ref?: React.ForwardedRef<HTMLButtonElement>;
  } =
    forwardedRef === null
      ? propsWithoutRef
      : { ...propsWithoutRef, ref: forwardedRef };
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size ?? 'default'}
      className={cn(switchVariants({ size, className }))}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={switchThumbVariants({ size })}
      />
    </SwitchPrimitive.Root>
  );
});

export { Switch, type SwitchProps, switchVariants };
