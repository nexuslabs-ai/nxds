<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface EmptyStateHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<EmptyStateHeaderProps>();
</script>

<template>
  <div
    data-slot="empty-state-header"
    :class="
      cn(
        'nx:flex nx:max-w-sm nx:flex-col nx:items-center nx:gap-2',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
