<script setup lang="ts">
import { IconCircleFilled } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuItemIndicator,
  DropdownMenuRadioItem,
  type DropdownMenuRadioItemEmits,
  type DropdownMenuRadioItemProps as RekaDropdownMenuRadioItemProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface DropdownMenuRadioItemProps extends RekaDropdownMenuRadioItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuRadioItemProps>();
const emits = defineEmits<DropdownMenuRadioItemEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuRadioItem
    v-bind="forwarded"
    data-slot="dropdown-menu-radio-item"
    :class="
      cn(
        'nx:group nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pl-[calc(var(--nx-icon-glyph-default)_+_var(--nx-spacing-2)*2)] nx:pr-2 nx:typography-body-default nx:outline-none',
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
        data-slot="dropdown-menu-radio-indicator"
      >
        <IconCircleFilled
          data-slot="dropdown-menu-radio-indicator-icon"
          aria-hidden="true"
          :class="
            cn(
              'nx:size-2',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
            )
          "
        />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </DropdownMenuRadioItem>
</template>
