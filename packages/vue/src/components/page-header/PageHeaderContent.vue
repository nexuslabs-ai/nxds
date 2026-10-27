<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PageHeaderContentProps>();
</script>

<template>
  <div
    data-slot="page-header-content"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:grow nx:basis-xs nx:flex-col nx:gap-1',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
