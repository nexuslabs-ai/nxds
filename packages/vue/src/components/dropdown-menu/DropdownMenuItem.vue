<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuItem,
  type DropdownMenuItemEmits,
  type DropdownMenuItemProps as RekaDropdownMenuItemProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type DropdownMenuItemVariants, dropdownMenuItemVariants } from '.';

export interface DropdownMenuItemProps extends RekaDropdownMenuItemProps {
  variant?: DropdownMenuItemVariants['variant'];
  /**
   * Indents the item to line up with items that have a leading icon or check.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<DropdownMenuItemProps>(), {
  variant: 'default',
});
const emits = defineEmits<DropdownMenuItemEmits>();

const delegated = reactiveOmit(props, 'class', 'inset', 'variant');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuItem
    v-bind="forwarded"
    data-slot="dropdown-menu-item"
    :data-inset="inset || undefined"
    :data-variant="variant"
    :class="
      cn(
        dropdownMenuItemVariants({ variant }),
        inset &&
          'nx:pl-[calc(var(--nx-icon-glyph-default)_+_var(--nx-spacing-2)*2)]',
        props.class
      )
    "
  >
    <slot />
  </DropdownMenuItem>
</template>
