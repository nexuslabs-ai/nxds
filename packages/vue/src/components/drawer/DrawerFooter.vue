<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DrawerFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DrawerFooterProps>();
</script>

<template>
  <div
    data-slot="drawer-footer"
    :class="
      cn(
        'nx:mt-auto nx:flex nx:shrink-0 nx:flex-col nx:gap-2 nx:p-6',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
