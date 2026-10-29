<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarGroupProps>();
</script>

<template>
  <div
    data-slot="sidebar-group"
    :class="
      cn(
        'nx:relative nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:p-2',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
