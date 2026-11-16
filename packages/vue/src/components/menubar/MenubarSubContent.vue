<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarSubContent,
  type MenubarSubContentEmits,
  type MenubarSubContentProps as RekaMenubarSubContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface MenubarSubContentProps extends RekaMenubarSubContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarSubContentProps>();
const emits = defineEmits<MenubarSubContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarSubContent
    v-bind="forwarded"
    data-slot="menubar-sub-content"
    :class="
      cn(
        'nx:z-popover nx:min-w-32 nx:overflow-hidden',
        popoverSurfaceClassName,
        'nx:p-1 nx:nest-outer-md nx:nest-border-default nx:nest-padding-1 nx:[&>:first-child]:rounded-t-nest-corner nx:[&>:last-child]:rounded-b-nest-corner nx:[&>[role=group]:first-child>:first-child]:rounded-t-nest-corner nx:[&>[role=group]:last-child>:last-child]:rounded-b-nest-corner',
        overlayFloatingTransitionClassName,
        props.class
      )
    "
  >
    <slot />
  </MenubarSubContent>
</template>
