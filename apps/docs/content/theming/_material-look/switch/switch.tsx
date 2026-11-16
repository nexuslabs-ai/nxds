import * as React from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// The root is the whole touch area. It draws the track inside its edges, and a
// round halo behind the thumb on hover. The thumb is larger than the track and
// lifts off the page with a shadow.
const switchVariants = cva(
  [
    'nx:group nx:peer nx:relative nx:isolate nx:inline-flex nx:shrink-0 nx:cursor-pointer nx:rounded-full nx:border-0 nx:bg-transparent nx:p-0',
    'nx:before:absolute nx:before:rounded-full nx:before:transition-colors',
    'nx:data-[state=unchecked]:before:bg-muted-foreground-subtle nx:data-[state=checked]:before:bg-primary-background/50',
    'nx:after:absolute nx:after:top-0 nx:after:left-0 nx:after:aspect-square nx:after:h-full nx:after:rounded-full nx:after:transition-[background-color,translate]',
    'nx:enabled:hover:after:bg-background-hover-alpha nx:enabled:hover:data-[state=checked]:after:bg-primary-background/4',
    'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
    'nx:disabled:cursor-not-allowed nx:disabled:data-[state=checked]:before:bg-disabled nx:disabled:data-[state=unchecked]:before:bg-disabled',
  ],
  {
    variants: {
      size: {
        default:
          'nx:h-[38px] nx:w-[58px] nx:before:inset-3 nx:data-[state=checked]:after:translate-x-5 nx:focus-visible:-outline-offset-8',
        sm: 'nx:h-6 nx:w-10 nx:before:inset-[7px] nx:data-[state=checked]:after:translate-x-4 nx:focus-visible:-outline-offset-4',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const switchThumbVariants = cva(
  [
    'nx:pointer-events-none nx:absolute nx:z-10 nx:block nx:rounded-full',
    'nx:bg-control-thumb nx:shadow-xs nx:transition-[background-color,translate]',
    'nx:data-[state=checked]:bg-primary-background',
    'nx:data-disabled:bg-muted',
  ],
  {
    variants: {
      size: {
        default:
          'nx:top-[9px] nx:left-[9px] nx:size-5 nx:data-[state=checked]:translate-x-5',
        sm: 'nx:top-1 nx:left-1 nx:size-4 nx:data-[state=checked]:translate-x-4',
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
