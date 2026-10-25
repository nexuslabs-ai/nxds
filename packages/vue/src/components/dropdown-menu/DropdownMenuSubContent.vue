<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuSubContent,
  type DropdownMenuSubContentEmits,
  type DropdownMenuSubContentProps as RekaDropdownMenuSubContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface DropdownMenuSubContentProps extends RekaDropdownMenuSubContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuSubContentProps>();
const emits = defineEmits<DropdownMenuSubContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuSubContent
    v-bind="forwarded"
    data-slot="dropdown-menu-sub-content"
    :class="
      cn(
        'nx:z-popover nx:min-w-32 nx:overflow-hidden',
        popoverSurfaceClassName,
        'nx:p-1',
        overlayFloatingTransitionClassName,
        props.class
      )
    "
  >
    <slot />
  </DropdownMenuSubContent>
</template>
