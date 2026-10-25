<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DrawerHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DrawerHeaderProps>();
</script>

<template>
  <div
    data-slot="drawer-header"
    :class="
      cn(
        'nx:flex nx:shrink-0 nx:flex-col nx:gap-1.5 nx:p-6 nx:group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center nx:group-data-[vaul-drawer-direction=top]/drawer-content:text-center nx:md:text-left',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
