<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PaginationProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PaginationProps>();
</script>

<template>
  <nav
    aria-label="pagination"
    data-slot="pagination"
    :class="cn('nx:mx-auto nx:flex nx:w-full nx:justify-center', props.class)"
  >
    <slot />
  </nav>
</template>
