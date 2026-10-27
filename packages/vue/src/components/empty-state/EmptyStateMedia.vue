<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type EmptyStateMediaVariants, emptyStateMediaVariants } from '.';

export interface EmptyStateMediaProps {
  variant?: EmptyStateMediaVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<EmptyStateMediaProps>(), {
  variant: 'default',
});
</script>

<template>
  <div
    data-slot="empty-state-media"
    :data-variant="variant"
    :class="cn(emptyStateMediaVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
