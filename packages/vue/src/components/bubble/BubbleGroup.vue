<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BubbleGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BubbleGroupProps>();
</script>

<template>
  <div
    data-slot="bubble-group"
    :class="cn('nx:flex nx:w-full nx:flex-col nx:gap-4', props.class)"
  >
    <slot />
  </div>
</template>
