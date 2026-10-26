<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ItemGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ItemGroupProps>();
</script>

<template>
  <div
    data-slot="item-group"
    :class="cn('nx:group/item-group nx:flex nx:flex-col', props.class)"
  >
    <slot />
  </div>
</template>
