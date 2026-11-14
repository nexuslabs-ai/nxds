<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BreadcrumbPageProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbPageProps>();
</script>

<template>
  <span
    data-slot="breadcrumb-page"
    aria-current="page"
    :class="
      cn(
        'nx:inline-flex nx:min-w-0 nx:max-w-[calc(150px*var(--nx-ui-scale))] nx:items-center nx:gap-1 nx:rounded-md nx:px-1.5 nx:typography-label-default nx:text-foreground nx:[&>span]:min-w-0 nx:[&>span]:truncate nx:[&_svg]:size-icon-glyph-default nx:[&_svg]:shrink-0 nx:icon-stroke',
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
