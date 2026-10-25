<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ContextMenuItem,
  type ContextMenuItemEmits,
  type ContextMenuItemProps as RekaContextMenuItemProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type ContextMenuItemVariants, contextMenuItemVariants } from '.';

export interface ContextMenuItemProps extends RekaContextMenuItemProps {
  variant?: ContextMenuItemVariants['variant'];
  /**
   * Indents the item to line up with items that have a leading icon or check.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ContextMenuItemProps>(), {
  variant: 'default',
});
const emits = defineEmits<ContextMenuItemEmits>();

const delegated = reactiveOmit(props, 'class', 'inset', 'variant');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuItem
    v-bind="forwarded"
    data-slot="context-menu-item"
    :data-inset="inset || undefined"
    :data-variant="variant"
    :class="
      cn(contextMenuItemVariants({ variant }), inset && 'nx:pl-8', props.class)
    "
  >
    <slot />
  </ContextMenuItem>
</template>
