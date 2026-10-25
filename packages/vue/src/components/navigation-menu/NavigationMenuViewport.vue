<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuViewport,
  type NavigationMenuViewportProps as RekaNavigationMenuViewportProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface NavigationMenuViewportProps extends RekaNavigationMenuViewportProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuViewportProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <div
    class="nx:absolute nx:top-full nx:left-0 nx:isolate nx:z-popover nx:flex nx:justify-center"
  >
    <NavigationMenuViewport
      v-bind="forwarded"
      data-slot="navigation-menu-viewport"
      :class="
        cn(
          'nx:origin-top nx:relative nx:mt-1.5 nx:h-(--reka-navigation-menu-viewport-height) nx:w-full nx:overflow-hidden',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          'nx:@md/navmenu:w-(--reka-navigation-menu-viewport-width)',
          props.class
        )
      "
    />
  </div>
</template>
