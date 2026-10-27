<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderMetaProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PageHeaderMetaProps>();
</script>

<template>
  <p
    data-slot="page-header-meta"
    :class="
      cn(
        'nx:m-0 nx:wrap-anywhere nx:typography-label-small nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </p>
</template>
