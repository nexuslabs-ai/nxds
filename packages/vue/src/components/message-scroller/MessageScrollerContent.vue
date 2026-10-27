<script setup lang="ts">
import type { ComponentPublicInstance, HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { useMessageScrollerNodes } from './message-scroller-context';

export interface MessageScrollerContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageScrollerContentProps>();

const { setContent } = useMessageScrollerNodes();

function registerContent(node: Element | ComponentPublicInstance | null) {
  setContent(node instanceof HTMLElement ? node : null);
}
</script>

<template>
  <div
    :ref="registerContent"
    data-slot="message-scroller-content"
    :class="
      cn(
        'nx:flex nx:h-max nx:min-h-full nx:flex-col nx:gap-6 nx:p-4',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
