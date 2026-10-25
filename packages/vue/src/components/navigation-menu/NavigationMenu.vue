<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuRoot,
  type NavigationMenuRootEmits,
  type NavigationMenuRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import NavigationMenuViewport from './NavigationMenuViewport.vue';

export interface NavigationMenuProps extends NavigationMenuRootProps {
  /**
   * Shows every flyout in one shared panel under the menu. Set `false` to
   * show each flyout under its own trigger.
   */
  viewport?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<NavigationMenuProps>(), {
  viewport: true,
});
const emits = defineEmits<NavigationMenuRootEmits>();

const delegated = reactiveOmit(props, 'class', 'viewport');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <NavigationMenuRoot
    v-bind="forwarded"
    aria-label="Main"
    data-slot="navigation-menu"
    :data-viewport="viewport"
    :class="
      cn(
        'nx:group/navigation-menu nx:@container/navmenu nx:relative nx:flex nx:w-full nx:items-center nx:justify-center',
        props.class
      )
    "
  >
    <slot />
    <NavigationMenuViewport v-if="viewport" />
  </NavigationMenuRoot>
</template>
