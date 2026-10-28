<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ToolbarGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ToolbarGroupProps>();
</script>

<template>
  <div
    role="group"
    data-slot="toolbar-group"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
