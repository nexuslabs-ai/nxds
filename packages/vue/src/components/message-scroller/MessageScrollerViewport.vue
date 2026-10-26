<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { ScrollAreaViewport, type ScrollAreaViewportProps } from 'reka-ui';
import type { ComponentPublicInstance, HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectMessageScrollerNodes, useMessageScroller } from '.';

export interface MessageScrollerViewportProps extends ScrollAreaViewportProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageScrollerViewportProps>();

const delegated = reactiveOmit(props, 'class');

const { isAtStart, isAtEnd } = useMessageScroller();
const { setViewport } = injectMessageScrollerNodes();

// Reka exposes the scrolling element as `viewportElement`; the component's own
// element is the non-scrolling content wrapper inside it.
function registerViewport(instance: Element | ComponentPublicInstance | null) {
  const exposed = instance as { viewportElement?: HTMLElement } | null;
  setViewport(exposed?.viewportElement ?? null);
}
</script>

<template>
  <ScrollAreaViewport
    v-bind="delegated"
    :ref="registerViewport"
    data-slot="message-scroller-viewport"
    tabindex="0"
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
