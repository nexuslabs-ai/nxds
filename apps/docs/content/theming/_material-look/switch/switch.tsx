import * as React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// The track is thinner than the thumb. The thumb hangs over the track's edges
// and lifts off the page with a shadow.
const switchVariants = cva(
  [
    'nx:peer nx:relative nx:target-24 nx:inline-flex nx:shrink-0 nx:cursor-pointer nx:items-center nx:border-0 nx:p-0',
    'nx:rounded-full nx:transition-control',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-offset-4 nx:focus-visible:outline-focus-default',
    'nx:data-[state=unchecked]:bg-muted-foreground-subtle nx:data-[state=checked]:bg-primary-background/50',
    'nx:disabled:cursor-not-allowed nx:disabled:data-[state=checked]:bg-disabled nx:disabled:data-[state=unchecked]:bg-disabled',
  ],
  {
    variants: {
      size: {
        default: 'nx:h-3.5 nx:w-9',
        sm: 'nx:h-2.5 nx:w-7',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const switchThumbVariants = cva(
  [
    'nx:pointer-events-none nx:absolute nx:top-1/2 nx:left-0 nx:block nx:-translate-y-1/2 nx:rounded-full',
    'nx:bg-control-thumb nx:shadow-xs nx:transition-[background-color,translate]',
    'nx:data-[state=checked]:bg-primary-background',
    'nx:data-disabled:bg-container-active',
  ],
  {
    variants: {
      size: {
        default: 'nx:size-5 nx:data-[state=checked]:translate-x-4',
        sm: 'nx:size-4 nx:data-[state=checked]:translate-x-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> &
  VariantProps<typeof switchVariants>;

/**
 * Turns one setting on or off, and applies it at once. Give it a label, or an
 * `aria-label`.
 */
function Switch({ className, size, ...props }: SwitchProps) {
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
}

export { Switch, type SwitchProps, switchVariants };
