<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ContextMenuLabel,
  type ContextMenuLabelProps as RekaContextMenuLabelProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { contextMenuInsetClassName } from '.';

export interface ContextMenuLabelProps extends RekaContextMenuLabelProps {
  /**
   * Indents the label to line up with items that have a leading icon or check.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = defineProps<ContextMenuLabelProps>();

const delegated = reactiveOmit(props, 'class', 'inset');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ContextMenuLabel
    v-bind="forwarded"
    data-slot="context-menu-label"
    :data-inset="inset || undefined"
    :class="
      cn(
        'nx:px-2 nx:py-1.5 nx:typography-label-default',
        inset && contextMenuInsetClassName,
        props.class
      )
    "
  >
    <slot />
  </ContextMenuLabel>
</template>
