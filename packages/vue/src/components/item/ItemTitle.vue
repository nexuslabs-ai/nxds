<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ItemTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ItemTitleProps>();
</script>

<template>
  <div
    data-slot="item-title"
    :class="
      cn(
        'nx:flex nx:w-fit nx:items-center nx:gap-2 nx:typography-label-default',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
