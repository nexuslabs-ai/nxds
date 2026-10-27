<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuIndicator,
  type NavigationMenuIndicatorProps as RekaNavigationMenuIndicatorProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface NavigationMenuIndicatorProps extends RekaNavigationMenuIndicatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuIndicatorProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <NavigationMenuIndicator
    v-bind="forwarded"
    data-slot="navigation-menu-indicator"
    :class="
      cn(
        'nx:top-full nx:z-1 nx:flex nx:h-1.5 nx:items-end nx:justify-center nx:overflow-hidden',
        'nx:transition-opacity nx:duration-fast nx:ease-move',
        'nx:data-[state=hidden]:opacity-0 nx:data-[state=hidden]:animate-overlay-presence-exit',
        props.class
      )
    "
  >
    <div
      class="nx:relative nx:top-[60%] nx:size-2 nx:rotate-45 nx:rounded-tl-sm nx:bg-border-default nx:shadow-sm"
    />
  </NavigationMenuIndicator>
</template>
