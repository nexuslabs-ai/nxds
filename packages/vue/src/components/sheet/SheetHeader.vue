<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SheetHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SheetHeaderProps>();
</script>

<template>
  <div
    data-slot="sheet-header"
    :class="cn('nx:flex nx:shrink-0 nx:flex-col nx:gap-1 nx:p-6', props.class)"
  >
    <slot />
  </div>
</template>
