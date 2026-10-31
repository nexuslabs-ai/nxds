<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarSubTrigger,
  type MenubarSubTriggerProps as RekaMenubarSubTriggerProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconChevronRight } from '../../lib/icons';
import { cn } from '../../lib/utils';

export interface MenubarSubTriggerProps extends RekaMenubarSubTriggerProps {
  /**
   * Indents the trigger to align with items that have a leading icon or checkbox.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarSubTriggerProps>();

const delegated = reactiveOmit(props, 'class', 'inset');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <MenubarSubTrigger
    v-bind="forwarded"
    data-slot="menubar-sub-trigger"
    :data-inset="inset || undefined"
    :class="
      cn(
        'nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2',
        'nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-[state=open]:bg-popover-hover nx:data-[state=open]:text-popover-foreground',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-icon-glyph-default nx:[&_svg]:shrink-0 nx:icon-stroke',
        inset && 'nx:pl-8',
        props.class
      )
    "
  >
    <slot />
    <IconChevronRight class="nx:ml-auto nx:size-icon-glyph-default" />
  </MenubarSubTrigger>
</template>
