<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuSubTrigger,
  type DropdownMenuSubTriggerProps as RekaDropdownMenuSubTriggerProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconChevronRight } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { menuItemInsetClassName } from '../overlay-layout/overlay-layout';

export interface DropdownMenuSubTriggerProps extends RekaDropdownMenuSubTriggerProps {
  /**
   * Indents the trigger to line up with items that have a leading icon or check.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuSubTriggerProps>();

const delegated = reactiveOmit(props, 'class', 'inset');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DropdownMenuSubTrigger
    v-bind="forwarded"
    data-slot="dropdown-menu-sub-trigger"
    :data-inset="inset || undefined"
    :class="
      cn(
        'nx:flex nx:cursor-default nx:select-none nx:items-center nx:gap-2',
        'nx:rounded-sm nx:px-2 nx:py-1.5 nx:typography-body-default nx:outline-none',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-[state=open]:bg-popover-hover nx:data-[state=open]:text-popover-foreground',
        'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-icon-glyph-default nx:[&_svg]:shrink-0 nx:icon-stroke',
        inset && menuItemInsetClassName,
        props.class
      )
    "
  >
    <slot />
    <IconChevronRight class="nx:ml-auto nx:size-icon-glyph-default" />
  </DropdownMenuSubTrigger>
</template>
