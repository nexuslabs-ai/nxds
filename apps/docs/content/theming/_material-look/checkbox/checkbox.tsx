import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';

import { selectionIndicatorMotionClassName } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * CheckboxProps
 *
 * Props for the Checkbox component.
 */
type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root>;

// Each mark is drawn on the whole 18px box, border included, so it keeps
// Material's proportions.
const markClassName = cn(
  'nx:absolute nx:inset-[calc(var(--nx-borderwidth-thick)*-1)]',
  selectionIndicatorMotionClassName
);

/**
 * Selects one or more options, or toggles one setting.
 * Set `checked="indeterminate"` to show a dash for a partly selected group, such as "select all".
 *
 * The box is 18px at the Default UI scale, with a round halo on hover. Pair it
 * with a `Label`.
 */
function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'nx:group nx:peer nx:relative nx:isolate nx:target-24 nx:inline-flex nx:size-[calc(var(--nx-icon-glyph-default)_+_2px)] nx:shrink-0 nx:cursor-pointer nx:items-center nx:justify-center nx:p-0',
        'nx:rounded-sm nx:border-thick nx:border-muted-foreground nx:bg-transparent nx:text-primary-foreground',
        'nx:transition-control',
        'nx:after:absolute nx:after:-inset-3.5 nx:after:-z-10 nx:after:rounded-full nx:after:transition-colors nx:enabled:hover:after:bg-background-hover-alpha',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-offset-2 nx:focus-visible:outline-focus-default',
        'nx:aria-invalid:border-border-error-active nx:aria-invalid:focus-visible:outline-focus-error',
        'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled',
        'nx:data-[state=checked]:border-primary-background nx:data-[state=checked]:bg-primary-background',
        'nx:data-[state=indeterminate]:border-primary-background nx:data-[state=indeterminate]:bg-primary-background',
        'nx:aria-invalid:data-[state=checked]:border-error-background nx:aria-invalid:data-[state=checked]:bg-error-background nx:aria-invalid:data-[state=checked]:text-error-foreground',
        'nx:aria-invalid:data-[state=indeterminate]:border-error-background nx:aria-invalid:data-[state=indeterminate]:bg-error-background nx:aria-invalid:data-[state=indeterminate]:text-error-foreground',
        'nx:data-[state=checked]:disabled:border-transparent nx:data-[state=checked]:disabled:bg-border-disabled',
        'nx:data-[state=indeterminate]:disabled:border-transparent nx:data-[state=indeterminate]:disabled:bg-border-disabled',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        forceMount
        data-slot="checkbox-indicator"
        className="nx:relative nx:flex nx:size-full nx:items-center nx:justify-center nx:text-current"
      >
        <svg
          data-slot="checkbox-check"
          aria-hidden="true"
          viewBox="3 3 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            markClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )}
        >
          <path d="M5.7 11.3 10 15.6l8.3-8.3" />
        </svg>
        <svg
          data-slot="checkbox-minus"
          aria-hidden="true"
          viewBox="3 3 18 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            markClassName,
            'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
          )}
        >
          <path d="M7 12h10" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, type CheckboxProps };
