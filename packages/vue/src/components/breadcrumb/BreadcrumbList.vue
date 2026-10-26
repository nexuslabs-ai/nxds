<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BreadcrumbListProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbListProps>();
</script>

<template>
  <ol
    data-slot="breadcrumb-list"
    tabindex="0"
    :class="
      cn(
        'nx:m-0 nx:flex nx:min-w-0 nx:max-w-full nx:list-none nx:flex-nowrap nx:items-center nx:gap-0.5 nx:overflow-x-auto nx:py-1.5 nx:pr-1.5 nx:pl-0 nx:typography-body-default nx:text-muted-foreground nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        props.class
      )
    "
  >
    <!-- The current page is a non-focusable <span>, so the list itself takes tabindex="0" to scroll an overflowing trail into view (WCAG 2.1.1). -->
    <slot />
  </ol>
</template>
