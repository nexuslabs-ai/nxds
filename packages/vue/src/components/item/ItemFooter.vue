<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ItemFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ItemFooterProps>();
</script>

<template>
  <div
    data-slot="item-footer"
    :class="
      cn(
        'nx:flex nx:basis-full nx:items-center nx:justify-between nx:gap-2',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
