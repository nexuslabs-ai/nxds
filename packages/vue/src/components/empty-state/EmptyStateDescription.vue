<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface EmptyStateDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<EmptyStateDescriptionProps>();
</script>

<template>
  <p
    data-slot="empty-state-description"
    :class="
      cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
