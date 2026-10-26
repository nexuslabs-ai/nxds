<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BreadcrumbEllipsisProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbEllipsisProps>();

// The template sets the dots with v-text. Prettier would wrap literal text onto
// its own line, and Vue renders that whitespace as spaces around the dots.
</script>

<template>
  <button
    data-slot="breadcrumb-ellipsis"
    type="button"
    aria-label="Show hidden breadcrumbs"
    :class="
      cn(
        'nx:inline-flex nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:px-1.5 nx:py-0 nx:text-inherit nx:typography-body-default nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        props.class
      )
    "
    v-text="'...'"
  />
</template>
