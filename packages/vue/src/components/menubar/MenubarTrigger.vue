<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarTrigger,
  type MenubarTriggerProps as RekaMenubarTriggerProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MenubarTriggerProps extends RekaMenubarTriggerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarTriggerProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <MenubarTrigger
    v-bind="forwarded"
    data-slot="menubar-trigger"
    :class="
      cn(
        'nx:flex nx:select-none nx:items-center nx:rounded-sm nx:border-0 nx:bg-transparent nx:px-2 nx:py-1 nx:text-inherit',
        'nx:typography-label-default nx:outline-none',
        'nx:focus:bg-container-hover nx:focus:text-foreground',
        'nx:data-[state=open]:bg-container-hover nx:data-[state=open]:text-foreground',
        props.class
      )
    "
  >
    <slot />
  </MenubarTrigger>
</template>
