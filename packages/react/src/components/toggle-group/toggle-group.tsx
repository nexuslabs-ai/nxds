'use client';

import * as React from 'react';

import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { toggleVariants } from '../toggle/toggle';

/** A step on the spacing scale. Each one has its own `--nx-spacing-*` variable. */
type ToggleGroupSpacing =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 14
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 44
  | 48
  | 52
  | 56
  | 60
  | 64
  | 72
  | 80
  | 96;

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing: ToggleGroupSpacing;
    orientation: 'horizontal' | 'vertical';
  }
>({
  spacing: 0,
  orientation: 'horizontal',
});

/**
 * Props for ToggleGroup.
 */
// A `type` intersection (not an `interface extends`) because Radix's
// ToggleGroup.Root props are a discriminated union (single | multiple) —
// extending a union from an interface drops `children`.
type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /**
     * Gap between items, in spacing-scale units. `0` joins them into one
     * segmented control. A larger value splits them into separate pills.
     */
    spacing?: ToggleGroupSpacing;
  };

/**
 * Set of related toggles that share `variant` and `size`. `type="single"` allows
 * one pressed item, which users can clear. `type="multiple"` allows several.
 *
 * `aria-invalid` on the group does not style its items. Set it on each
 * `ToggleGroupItem` and describe the error in your own text.
 */
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = 'horizontal',
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive.Root
      orientation={orientation}
      // Spacing-scale gap via the runtime spacing var (nxds resets the base
      // --spacing, so Tailwind's --spacing() function is unavailable here).
      // A half step such as 0.5 is named `--nx-spacing-0_5`.
      style={
        spacing
          ? { gap: `var(--nx-spacing-${String(spacing).replace('.', '_')})` }
          : undefined
      }
      className={cn(
        'nx:flex nx:w-fit nx:items-center nx:rounded-md nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        spacing === 0 && 'nx:isolate',
        className
      )}
      {...props}
      data-slot="toggle-group"
      data-variant={variant ?? 'default'}
      data-size={size ?? 'default'}
      data-spacing={spacing}
      data-orientation={orientation}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

// Joined bordered items overlap by one stroke, so each pair shares a single
// edge. Whichever item stacks higher paints that edge: focus, then selected
// invalid, invalid, selected, hover; equal items fall back to DOM order, so
// the later one wins. Disabled items never climb, so they never claim an
// edge. The focus rung repeats its class to outrank the (0,4,0)
// selected-invalid rung by specificity rather than by emit order.
const joinedItem = {
  base: 'nx:relative nx:rounded-none nx:not-disabled:hover:z-10 nx:not-disabled:data-[state=on]:z-20 nx:not-disabled:aria-invalid:z-30 nx:not-disabled:aria-invalid:data-[state=on]:z-40 nx:[&&&&:focus-visible]:z-50',
  horizontal:
    'nx:first:rounded-s-md nx:last:rounded-e-md nx:[[data-slot=toggle-group-item]:not([data-variant=default])+&:not([data-variant=default])]:-ms-(--nx-borderwidth-default)',
  vertical:
    'nx:first:rounded-t-md nx:last:rounded-b-md nx:[[data-slot=toggle-group-item]:not([data-variant=default])+&:not([data-variant=default])]:-mt-(--nx-borderwidth-default)',
} as const;

/**
 * Props for ToggleGroupItem.
 */
type ToggleGroupItemProps = React.ComponentProps<
  typeof ToggleGroupPrimitive.Item
> &
  VariantProps<typeof toggleVariants>;

/**
 * One toggle in a `ToggleGroup`. Takes `variant` and `size` from the group
 * unless set on the item.
 */
function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = variant ?? context.variant ?? 'default';
  const resolvedSize = size ?? context.size ?? 'default';
  const joined = context.spacing === 0;

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        'nx:min-w-0 nx:shrink-0',
        joined && [joinedItem.base, joinedItem[context.orientation]],
        className
      )}
      {...props}
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      data-orientation={context.orientation}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export {
  ToggleGroup,
  ToggleGroupItem,
  type ToggleGroupItemProps,
  type ToggleGroupProps,
};
