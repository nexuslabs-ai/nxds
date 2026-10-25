<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuContent,
  type NavigationMenuContentEmits,
  type NavigationMenuContentProps as RekaNavigationMenuContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  navigationMenuInlinePopoverSurfaceClassName,
  navigationMenuInlinePopoverTransitionClassName,
} from '../overlay-layout/overlay-layout';

export interface NavigationMenuContentProps extends RekaNavigationMenuContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuContentProps>();
const emits = defineEmits<NavigationMenuContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <NavigationMenuContent
    v-bind="forwarded"
    data-slot="navigation-menu-content"
    :class="
      cn(
        'nx:top-0 nx:left-0 nx:w-full nx:p-2 nx:pr-2.5',
        'nx:data-[motion=from-end]:slide-in-from-right-[1.5rem] nx:data-[motion=from-start]:slide-in-from-left-[1.5rem]',
        'nx:data-[motion=to-end]:slide-out-to-right-[1.5rem] nx:data-[motion=to-start]:slide-out-to-left-[1.5rem]',
        'nx:duration-fast nx:data-[motion^=from-]:animate-in nx:data-[motion^=from-]:fade-in nx:data-[motion^=to-]:animate-out nx:data-[motion^=to-]:fade-out',
        'nx:data-[motion^=from-]:duration-default nx:data-[motion^=from-]:ease-enter',
        'nx:data-[motion^=to-]:duration-fast nx:data-[motion^=to-]:ease-exit',
        'nx:@md/navmenu:absolute nx:@md/navmenu:w-auto',
        'nx:group-data-[viewport=false]/navigation-menu:top-full',
        'nx:group-data-[viewport=false]/navigation-menu:mt-1.5',
        'nx:group-data-[viewport=false]/navigation-menu:overflow-hidden',
        navigationMenuInlinePopoverSurfaceClassName,
        navigationMenuInlinePopoverTransitionClassName,
        props.class
      )
    "
  >
    <slot />
  </NavigationMenuContent>
</template>
