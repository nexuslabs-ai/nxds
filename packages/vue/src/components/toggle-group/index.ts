import type { InjectionKey } from 'vue';

import type { ToggleGroupProps } from './ToggleGroup.vue';

export {
  default as ToggleGroup,
  type ToggleGroupProps,
} from './ToggleGroup.vue';
export {
  default as ToggleGroupItem,
  type ToggleGroupItemProps,
} from './ToggleGroupItem.vue';

// Joined bordered items overlap by one stroke, so each pair shares a single
// edge. Whichever item stacks higher paints that edge: focus, then selected
// invalid, invalid, selected, hover; equal items fall back to DOM order, so
// the later one wins. Disabled items never climb, so they never claim an
// edge. The focus rung repeats its class to outrank the (0,4,0)
// selected-invalid rung by specificity rather than by emit order.
export const joinedItem = {
  base: 'nx:relative nx:rounded-none nx:not-disabled:hover:z-10 nx:not-disabled:data-[state=on]:z-20 nx:not-disabled:aria-invalid:z-30 nx:not-disabled:aria-invalid:data-[state=on]:z-40 nx:[&&&&:focus-visible]:z-50',
  horizontal:
    'nx:first:rounded-s-md nx:last:rounded-e-md nx:[[data-slot=toggle-group-item]:not([data-variant=default])+&:not([data-variant=default])]:-ms-(--nx-borderwidth-default)',
  vertical:
    'nx:first:rounded-t-md nx:last:rounded-b-md nx:[[data-slot=toggle-group-item]:not([data-variant=default])+&:not([data-variant=default])]:-mt-(--nx-borderwidth-default)',
} as const;

export const ToggleGroupKey: InjectionKey<
  Required<
    Pick<ToggleGroupProps, 'variant' | 'size' | 'spacing' | 'orientation'>
  >
> = Symbol('toggle-group');
