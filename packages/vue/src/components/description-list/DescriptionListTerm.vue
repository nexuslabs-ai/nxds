<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DescriptionListTermProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DescriptionListTermProps>();
</script>

<template>
  <dt
    data-slot="description-list-term"
    :class="
      cn(
        'nx:min-w-0 nx:@md/description-list:w-40 nx:@md/description-list:shrink-0 nx:wrap-anywhere nx:typography-label-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </dt>
</template>
