<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface TableCaptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableCaptionProps>();
</script>

<template>
  <caption
    data-slot="table-caption"
    :class="
      cn(
        'nx:mt-4 nx:typography-body-small nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </caption>
</template>
