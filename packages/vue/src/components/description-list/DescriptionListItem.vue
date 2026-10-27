<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DescriptionListItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DescriptionListItemProps>();
</script>

<template>
  <div
    data-slot="description-list-item"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:flex-col nx:gap-x-4 nx:gap-y-1 nx:@md/description-list:flex-row nx:@md/description-list:items-baseline',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
