<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarLabel,
  type MenubarLabelProps as RekaMenubarLabelProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { menuItemInsetClassName } from '../overlay-layout/overlay-layout';

export interface MenubarLabelProps extends RekaMenubarLabelProps {
  /**
   * Indents the label to align with items that have a leading icon or checkbox.
   */
  inset?: boolean;
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarLabelProps>();

const delegated = reactiveOmit(props, 'class', 'inset');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <MenubarLabel
    v-bind="forwarded"
    data-slot="menubar-label"
    :data-inset="inset || undefined"
    :class="
      cn(
        'nx:px-2 nx:py-1.5 nx:typography-label-default',
        inset && menuItemInsetClassName,
        props.class
      )
    "
  >
    <slot />
  </MenubarLabel>
</template>
