<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PaginationContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PaginationContentProps>();
</script>

<template>
  <ul
    data-slot="pagination-content"
    :class="
      cn(
        'nx:m-0 nx:flex nx:list-none nx:flex-row nx:items-center nx:gap-1 nx:p-0',
        props.class
      )
    "
  >
    <slot />
  </ul>
</template>
