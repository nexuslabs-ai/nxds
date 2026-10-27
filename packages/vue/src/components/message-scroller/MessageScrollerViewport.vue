<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaViewport, type ScrollAreaViewportProps } from 'reka-ui';
import { type HTMLAttributes, useTemplateRef, watch } from 'vue';

import { cn } from '../../lib/utils';

import { useMessageScrollerNodes } from './message-scroller-context';

import { useMessageScroller } from '.';

export interface MessageScrollerViewportProps extends ScrollAreaViewportProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageScrollerViewportProps>();

const delegated = reactiveOmit(props, 'class');

const { isAtStart, isAtEnd } = useMessageScroller();
const { setViewport } = useMessageScrollerNodes();

const viewport =
  useTemplateRef<InstanceType<typeof ScrollAreaViewport>>('viewport');

// Reka exposes the scrolling element as `viewportElement`, set only after it
// renders; the component's own element is the non-scrolling wrapper inside it.
watch(() => viewport.value?.viewportElement ?? null, setViewport, {
  immediate: true,
  flush: 'post',
});
</script>

<template>
  <ScrollAreaViewport
    v-bind="delegated"
    ref="viewport"
    data-slot="message-scroller-viewport"
    :class="
      cn(
        'nx:size-full nx:min-h-0 nx:min-w-0 nx:overscroll-contain nx:rounded-[inherit] nx:*:h-full nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        !isAtStart && 'nx:mask-t-from-90%',
        !isAtEnd && 'nx:mask-b-from-90%',
        props.class
      )
    "
  >
    <slot />
  </ScrollAreaViewport>
</template>
