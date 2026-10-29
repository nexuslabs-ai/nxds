<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MarkerIconProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MarkerIconProps>();
</script>

<template>
  <span
    data-slot="marker-icon"
    aria-hidden="true"
    :class="
      cn(
        'nx:inline-flex nx:size-icon-glyph-default nx:shrink-0 nx:items-center nx:justify-center',
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
