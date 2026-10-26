<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DescriptionListDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DescriptionListDescriptionProps>();
</script>

<template>
  <dd
    data-slot="description-list-description"
    :class="
      cn(
        'nx:m-0 nx:min-w-0 nx:flex-1 nx:wrap-anywhere nx:typography-body-default nx:text-foreground',
        props.class
      )
    "
  >
    <slot />
  </dd>
</template>
