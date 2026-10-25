<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SheetFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SheetFooterProps>();
</script>

<template>
  <div
    data-slot="sheet-footer"
    :class="
      cn(
        'nx:mt-auto nx:flex nx:shrink-0 nx:flex-col nx:gap-2 nx:p-6',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
