<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ItemContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ItemContentProps>();

// data-item-part is a structural hook: wrappers rename data-slot, so Item's CSS keys off it.
</script>

<template>
  <div
    data-slot="item-content"
    data-item-part="content"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:flex-col nx:gap-1 nx:[&+[data-item-part=content]]:flex-none',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
