<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DescriptionListProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DescriptionListProps>();
</script>

<template>
  <dl
    data-slot="description-list"
    :class="
      cn(
        'nx:@container/description-list nx:m-0 nx:grid nx:w-full nx:gap-2',
        props.class
      )
    "
  >
    <slot />
  </dl>
</template>
