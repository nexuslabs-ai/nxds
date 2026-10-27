<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  /**
   * Adds a dashed frame. Match a bordered skeleton so swapping from loading
   * doesn't shift the layout.
   */
  bordered?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  bordered: false,
});
</script>

<template>
  <div
    data-slot="empty-state"
    :data-bordered="bordered || undefined"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:items-center nx:justify-center nx:gap-6 nx:rounded-lg nx:bg-muted-extralight nx:p-6 nx:text-center nx:text-balance',
        bordered &&
          'nx:border-default nx:border-dashed nx:border-border-default',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
