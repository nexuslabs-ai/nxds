<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { IconDots } from '../../lib/icons';
import { cn } from '../../lib/utils';

export interface PaginationEllipsisProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PaginationEllipsisProps>();
</script>

<template>
  <span
    aria-hidden="true"
    data-slot="pagination-ellipsis"
    :class="
      cn(
        'nx:flex nx:items-center nx:justify-center nx:size-10 nx:icon-stroke',
        props.class
      )
    "
  >
    <IconDots class="nx:size-4" />
    <span class="nx:sr-only">More pages</span>
  </span>
</template>
