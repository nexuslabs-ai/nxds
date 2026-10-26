<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ItemActionsProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ItemActionsProps>();
</script>

<template>
  <div
    data-slot="item-actions"
    :class="cn('nx:flex nx:items-center nx:gap-2', props.class)"
  >
    <slot />
  </div>
</template>
