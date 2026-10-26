<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderActionsProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PageHeaderActionsProps>();
</script>

<template>
  <div
    data-slot="page-header-actions"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:max-w-full nx:flex-wrap nx:items-center nx:gap-2',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
