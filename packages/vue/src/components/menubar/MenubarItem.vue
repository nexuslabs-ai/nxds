<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarItem,
  type MenubarItemEmits,
  type MenubarItemProps as RekaMenubarItemProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type MenubarItemVariants, menubarItemVariants } from '.';

export interface MenubarItemProps extends RekaMenubarItemProps {
  variant?: MenubarItemVariants['variant'];
  /**
   * Indents the item to align with items that have a leading icon or checkbox.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MenubarItemProps>(), {
  variant: 'default',
});
const emits = defineEmits<MenubarItemEmits>();

const delegated = reactiveOmit(props, 'class', 'inset', 'variant');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarItem
    v-bind="forwarded"
    data-slot="menubar-item"
    :data-inset="inset || undefined"
    :data-variant="variant"
    :class="
      cn(
        menubarItemVariants({ variant }),
        inset &&
          'nx:pl-[calc(var(--nx-icon-glyph-default)_+_var(--nx-spacing-2)*2)]',
        props.class
      )
    "
  >
    <slot />
  </MenubarItem>
</template>
