<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BreadcrumbItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbItemProps>();
</script>

<template>
  <li
    data-slot="breadcrumb-item"
    :class="
      cn('nx:inline-flex nx:min-w-0 nx:items-center nx:gap-0', props.class)
    "
  >
    <slot />
  </li>
</template>
