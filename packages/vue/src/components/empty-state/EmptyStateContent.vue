<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface EmptyStateContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<EmptyStateContentProps>();
</script>

<template>
  <div
    data-slot="empty-state-content"
    :class="
      cn(
        'nx:flex nx:w-full nx:max-w-sm nx:min-w-0 nx:flex-col nx:items-center nx:gap-4',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
