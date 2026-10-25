<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuLabel,
  type DropdownMenuLabelProps as RekaDropdownMenuLabelProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DropdownMenuLabelProps extends RekaDropdownMenuLabelProps {
  /**
   * Indents the label to line up with items that have a leading icon or check.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuLabelProps>();

const delegated = reactiveOmit(props, 'class', 'inset');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DropdownMenuLabel
    v-bind="forwarded"
    data-slot="dropdown-menu-label"
    :data-inset="inset || undefined"
    :class="
      cn(
        'nx:px-2 nx:py-1.5 nx:typography-label-default',
        inset && 'nx:pl-8',
        props.class
      )
    "
  >
    <slot />
  </DropdownMenuLabel>
</template>
