<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarItemIndicator,
  MenubarRadioItem,
  type MenubarRadioItemEmits,
  type MenubarRadioItemProps as RekaMenubarRadioItemProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface MenubarRadioItemProps extends RekaMenubarRadioItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarRadioItemProps>();
const emits = defineEmits<MenubarRadioItemEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarRadioItem
    v-bind="forwarded"
    data-slot="menubar-radio-item"
    :class="
      cn(
        'nx:group nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:icon-stroke',
        'nx:rounded-sm nx:py-1.5 nx:pl-8 nx:pr-2 nx:typography-body-default nx:outline-none',
        'nx:transition-colors',
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        props.class
      )
    "
  >
    <span
      class="nx:pointer-events-none nx:absolute nx:left-2 nx:flex nx:size-3.5 nx:items-center nx:justify-center"
    >
      <MenubarItemIndicator force-mount data-slot="menubar-radio-indicator">
        <IconCircleFilled
          data-slot="menubar-radio-indicator-icon"
          aria-hidden="true"
          :class="
            cn(
              'nx:size-2 nx:[--nx-icon-size:var(--nx-spacing-2)]',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
            )
          "
        />
      </MenubarItemIndicator>
    </span>
    <slot />
  </MenubarRadioItem>
</template>
