<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

export interface BreadcrumbMenuTriggerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbMenuTriggerProps>();
</script>

<template>
  <button
    data-slot="breadcrumb-menu-trigger"
    type="button"
    aria-label="Show alternate paths"
    :class="
      cn(
        'nx:inline-flex nx:size-5 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:p-0 nx:text-inherit nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:data-[state=open]:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&_svg]:size-4 nx:[&_svg]:shrink-0 nx:icon-stroke',
        props.class
      )
    "
  >
    <slot><IconChevronDown aria-hidden="true" /></slot>
  </button>
</template>
