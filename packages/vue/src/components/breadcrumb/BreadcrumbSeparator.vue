<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BreadcrumbSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbSeparatorProps>();
</script>

<template>
  <li
    data-slot="breadcrumb-separator"
    role="presentation"
    aria-hidden="true"
    :class="
      cn(
        'nx:inline-flex nx:shrink-0 nx:items-center nx:typography-body-default nx:text-muted-foreground nx:[&>svg]:size-icon-glyph-sm nx:icon-stroke',
        props.class
      )
    "
  >
    <slot>/</slot>
  </li>
</template>
