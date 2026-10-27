<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type ItemMediaVariants, itemMediaVariants } from '.';

export interface ItemMediaProps {
  variant?: ItemMediaVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ItemMediaProps>(), {
  variant: 'default',
});
</script>

<template>
  <div
    data-slot="item-media"
    :data-variant="variant"
    :class="cn(itemMediaVariants({ variant }), props.class)"
  >
    <slot />
  </div>
</template>
