<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type BubbleReactionsVariants, bubbleReactionsVariants } from '.';

export interface BubbleReactionsProps {
  side?: BubbleReactionsVariants['side'];
  align?: BubbleReactionsVariants['align'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<BubbleReactionsProps>(), {
  side: 'bottom',
  align: 'end',
});
</script>

<template>
  <div
    data-slot="bubble-reactions"
    data-bubble-part="reactions"
    :data-side="side"
    :data-align="align"
    :class="cn(bubbleReactionsVariants({ side, align }), props.class)"
  >
    <slot />
  </div>
</template>
