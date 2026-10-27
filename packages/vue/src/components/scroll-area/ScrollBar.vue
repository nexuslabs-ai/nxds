<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ScrollAreaScrollbar,
  type ScrollAreaScrollbarProps,
  ScrollAreaThumb,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { scrollBarVariants } from '.';

export interface ScrollBarProps extends ScrollAreaScrollbarProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ScrollBarProps>(), {
  orientation: 'vertical',
});

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <ScrollAreaScrollbar
    v-bind="delegated"
    data-slot="scroll-bar"
    :class="cn(scrollBarVariants({ orientation }), props.class)"
  >
    <ScrollAreaThumb
      data-slot="scroll-bar-thumb"
      class="nx:relative nx:flex-1 nx:rounded-full nx:bg-border-default"
    />
  </ScrollAreaScrollbar>
</template>
