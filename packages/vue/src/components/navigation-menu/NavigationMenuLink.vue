<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuLink,
  type NavigationMenuLinkEmits,
  type NavigationMenuLinkProps as RekaNavigationMenuLinkProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface NavigationMenuLinkProps extends RekaNavigationMenuLinkProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuLinkProps>();
const emits = defineEmits<NavigationMenuLinkEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <NavigationMenuLink
    v-bind="forwarded"
    data-slot="navigation-menu-link"
    :class="
      cn(
        'nx:flex nx:flex-col nx:gap-1 nx:rounded-sm nx:p-2 nx:text-inherit nx:no-underline nx:typography-body-default nx:transition-control',
        'nx:hover:bg-popover-hover nx:hover:text-popover-foreground',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:data-[active=true]:bg-popover-hover nx:data-[active=true]:text-popover-foreground',
        'nx:[&_svg:not([class*=size-])]:size-icon-glyph-default nx:[&_svg:not([class*=text-])]:text-muted-foreground nx:icon-stroke',
        props.class
      )
    "
  >
    <slot />
  </NavigationMenuLink>
</template>
