<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ContextMenuItemIndicator,
  ContextMenuRadioItem,
  type ContextMenuRadioItemEmits,
  type ContextMenuRadioItemProps as RekaContextMenuRadioItemProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconCircleFilled } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';

export interface ContextMenuRadioItemProps extends RekaContextMenuRadioItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ContextMenuRadioItemProps>();
const emits = defineEmits<ContextMenuRadioItemEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuRadioItem
    v-bind="forwarded"
    data-slot="context-menu-radio-item"
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
      <ContextMenuItemIndicator
        force-mount
        data-slot="context-menu-radio-indicator"
      >
        <IconCircleFilled
          data-slot="context-menu-radio-indicator-icon"
          aria-hidden="true"
          :class="
            cn(
              'nx:size-icon-[length:var(--nx-spacing-2)]',
              selectionIndicatorMotionClassName,
              'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
            )
          "
        />
      </ContextMenuItemIndicator>
    </span>
    <slot />
  </ContextMenuRadioItem>
</template>
