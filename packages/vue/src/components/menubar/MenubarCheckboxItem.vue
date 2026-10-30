<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarCheckboxItem,
  type MenubarCheckboxItemEmits,
  type MenubarCheckboxItemProps as RekaMenubarCheckboxItemProps,
  MenubarItemIndicator,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconCheck } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

import { menubarInsetClassName } from '.';

export interface MenubarCheckboxItemProps extends RekaMenubarCheckboxItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarCheckboxItemProps>();
const emits = defineEmits<MenubarCheckboxItemEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarCheckboxItem
    v-bind="forwarded"
    data-slot="menubar-checkbox-item"
    :class="
      cn(
        'nx:group nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center',
        'nx:rounded-sm nx:py-1.5 nx:pr-2 nx:typography-body-default nx:outline-none',
        menubarInsetClassName,
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
      <MenubarItemIndicator force-mount data-slot="menubar-checkbox-indicator">
        <IconCheck
          data-slot="menubar-checkbox-indicator-icon"
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
      </MenubarItemIndicator>
    </span>
    <slot />
  </MenubarCheckboxItem>
</template>
