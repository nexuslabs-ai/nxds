<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuList,
  type NavigationMenuListProps as RekaNavigationMenuListProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface NavigationMenuListProps extends RekaNavigationMenuListProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuListProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <NavigationMenuList
    v-bind="forwarded"
    data-slot="navigation-menu-list"
    :class="
      cn(
        'nx:group nx:m-0 nx:flex nx:flex-1 nx:list-none nx:items-center nx:justify-center nx:gap-1 nx:p-0',
        props.class
      )
    "
  >
    <slot />
  </NavigationMenuList>
</template>
