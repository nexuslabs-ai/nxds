<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  type ScrollAreaRootProps,
  ScrollAreaViewport,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import ScrollBar from './ScrollBar.vue';

export interface ScrollAreaProps extends ScrollAreaRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ScrollAreaProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollAreaRoot
    v-bind="delegated"
    data-slot="scroll-area"
    :class="cn('nx:relative', props.class)"
  >
    <ScrollAreaViewport
      data-slot="scroll-area-viewport"
      tabindex="0"
      class="nx:size-full nx:rounded-[inherit] nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollBar />
    <ScrollAreaCorner data-slot="scroll-area-corner" />
  </ScrollAreaRoot>
</template>
