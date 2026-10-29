<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuCheckboxItem,
  type DropdownMenuCheckboxItemEmits,
  type DropdownMenuCheckboxItemProps as RekaDropdownMenuCheckboxItemProps,
  DropdownMenuItemIndicator,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface DropdownMenuCheckboxItemProps extends RekaDropdownMenuCheckboxItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuCheckboxItemProps>();
const emits = defineEmits<DropdownMenuCheckboxItemEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuCheckboxItem
    v-bind="forwarded"
    data-slot="dropdown-menu-checkbox-item"
    :class="
      cn(
        'nx:group nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        props.class
      )
    "
  >
    <span
      class="nx:pointer-events-none nx:absolute nx:left-2 nx:flex nx:size-icon-glyph-default nx:items-center nx:justify-center"
    >
      <DropdownMenuItemIndicator
        force-mount
        data-slot="dropdown-menu-checkbox-indicator"
      >
        <IconCheck
          data-slot="dropdown-menu-checkbox-indicator-icon"
          aria-hidden="true"
          :class="
            cn(
              'nx:size-icon-glyph-default',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100',
              'nx:group-data-[state=indeterminate]:scale-100 nx:group-data-[state=indeterminate]:opacity-100'
            )
          "
        />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuCheckboxItem>
</template>
