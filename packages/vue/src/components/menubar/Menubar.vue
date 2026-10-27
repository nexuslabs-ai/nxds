<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarRoot,
  type MenubarRootEmits,
  type MenubarRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MenubarProps extends MenubarRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarProps>();
const emits = defineEmits<MenubarRootEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarRoot
    v-bind="forwarded"
    data-slot="menubar"
    :class="
      cn(
        'nx:flex nx:items-center nx:gap-1 nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:p-1 nx:shadow-xs',
        props.class
      )
    "
  >
    <slot />
  </MenubarRoot>
</template>
