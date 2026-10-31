<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  NavigationMenuTrigger,
  type NavigationMenuTriggerProps as RekaNavigationMenuTriggerProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

import { navigationMenuTriggerStyle } from '.';

export interface NavigationMenuTriggerProps extends RekaNavigationMenuTriggerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<NavigationMenuTriggerProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <NavigationMenuTrigger
    v-bind="forwarded"
    data-slot="navigation-menu-trigger"
    :class="cn(navigationMenuTriggerStyle(), 'nx:group', props.class)"
  >
    <slot />{{ ' ' }}
    <IconChevronDown
      class="nx:relative nx:top-px nx:ml-1 nx:size-icon-glyph-xs nx:transition nx:duration-slow nx:group-data-[state=open]:rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuTrigger>
</template>
