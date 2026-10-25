<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { useForwardProps } from 'reka-ui';
import {
  DrawerDescription,
  type DrawerDescriptionProps as VaulDrawerDescriptionProps,
} from 'vaul-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DrawerDescriptionProps extends VaulDrawerDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DrawerDescriptionProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DrawerDescription
    v-bind="forwarded"
    data-slot="drawer-description"
    :class="
      cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </DrawerDescription>
</template>
