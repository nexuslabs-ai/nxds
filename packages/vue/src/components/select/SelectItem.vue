<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SelectItem,
  type SelectItemEmits,
  type SelectItemProps as RekaSelectItemProps,
  SelectItemText,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconCheck } from '../../lib/icons';
import { selectionIndicatorMotionClassName } from '../../lib/motion';
import { cn } from '../../lib/utils';
import { menuItemInsetClassName } from '../overlay-layout/overlay-layout';

export interface SelectItemProps extends RekaSelectItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SelectItemProps>();
const emits = defineEmits<SelectItemEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <SelectItem
    v-bind="forwarded"
    data-slot="select-item"
    :class="
      cn(
        'nx:group nx:relative nx:flex nx:w-full nx:cursor-default nx:select-none nx:items-center nx:icon-stroke',
        'nx:rounded-sm nx:py-1.5 nx:pr-2 nx:typography-body-default nx:outline-none',
        menuItemInsetClassName,
        'nx:focus:bg-popover-hover nx:focus:text-popover-foreground',
        'nx:data-disabled:pointer-events-none nx:data-disabled:text-disabled-foreground',
        props.class
      )
    "
  >
    <span
      class="nx:pointer-events-none nx:absolute nx:left-2 nx:flex nx:size-icon-glyph-default nx:items-center nx:justify-center"
    >
      <IconCheck
        data-slot="select-item-indicator-icon"
        aria-hidden="true"
        :class="
          cn(
            'nx:size-icon-glyph-default',
            selectionIndicatorMotionClassName,
            'nx:group-data-[state=checked]:scale-100 nx:group-data-[state=checked]:opacity-100'
          )
        "
      />
    </span>
    <SelectItemText><slot /></SelectItemText>
  </SelectItem>
</template>
