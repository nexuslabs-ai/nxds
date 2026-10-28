<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ScrollAreaCorner,
  ScrollAreaRoot,
  type ScrollAreaRootProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { ScrollBar } from '../scroll-area';

import { useMessageScroller } from '.';

export interface MessageScrollerProps extends ScrollAreaRootProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageScrollerProps>();

const delegated = reactiveOmit(props, 'class');

const { isAtStart, isAtEnd } = useMessageScroller();
</script>

<template>
  <ScrollAreaRoot
    v-bind="delegated"
    data-slot="message-scroller"
    :data-at-start="isAtStart"
    :data-at-end="isAtEnd"
    :class="
      cn(
        'nx:relative nx:flex nx:min-h-0 nx:w-full nx:flex-col nx:overflow-hidden',
        props.class
      )
    "
  >
    <slot />
    <ScrollBar />
    <ScrollAreaCorner data-slot="message-scroller-corner" />
  </ScrollAreaRoot>
</template>
