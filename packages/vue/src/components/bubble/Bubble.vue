<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type BubbleVariants, bubbleVariants } from '.';

export interface BubbleProps {
  variant?: BubbleVariants['variant'];
  align?: BubbleVariants['align'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<BubbleProps>(), {
  variant: 'muted',
});
</script>

<template>
  <div
    data-slot="bubble"
    :data-variant="variant"
    :data-align="align"
    :class="cn(bubbleVariants({ variant, align }), props.class)"
  >
    <slot />
  </div>
</template>
