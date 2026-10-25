<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { useForwardProps } from 'reka-ui';
import {
  DrawerTitle,
  type DrawerTitleProps as VaulDrawerTitleProps,
} from 'vaul-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DrawerTitleProps extends VaulDrawerTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DrawerTitleProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DrawerTitle
    v-bind="forwarded"
    data-slot="drawer-title"
    :class="cn('nx:m-0 nx:typography-heading-xsmall', props.class)"
  >
    <slot />
  </DrawerTitle>
</template>
