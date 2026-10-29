<script setup lang="ts">
import { IconDots } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

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
      cn('nx:flex nx:items-center nx:justify-center nx:size-10', props.class)
    "
  >
    <IconDots class="nx:size-icon-glyph-default" />
    <span class="nx:sr-only">More pages</span>
  </span>
</template>
