<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MarkerContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MarkerContentProps>();
</script>

<template>
  <span
    data-slot="marker-content"
    :class="
      cn(
        'nx:min-w-0 nx:wrap-break-word nx:[&>a]:text-inherit nx:[&>a]:underline nx:[&>a]:underline-offset-4 nx:[&>a:hover]:text-primary-subtle-foreground nx:group-data-[variant=separator]/marker:text-center',
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
