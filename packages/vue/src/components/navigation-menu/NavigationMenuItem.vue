<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuItem,
  type NavigationMenuItemProps as RekaNavigationMenuItemProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface NavigationMenuItemProps extends RekaNavigationMenuItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuItemProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <NavigationMenuItem
    v-bind="forwarded"
    data-slot="navigation-menu-item"
    :class="cn('nx:relative', props.class)"
  >
    <slot />
  </NavigationMenuItem>
</template>
