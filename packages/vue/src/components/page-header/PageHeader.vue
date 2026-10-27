<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PageHeaderProps>();
</script>

<template>
  <header
    data-slot="page-header"
    :class="
      cn('nx:flex nx:w-full nx:flex-wrap nx:items-start nx:gap-4', props.class)
    "
  >
    <slot />
  </header>
</template>
