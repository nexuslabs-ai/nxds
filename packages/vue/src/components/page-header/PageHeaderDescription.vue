<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PageHeaderDescriptionProps>();
</script>

<template>
  <p
    data-slot="page-header-description"
    :class="
      cn(
        'nx:m-0 nx:wrap-anywhere nx:typography-body-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
