<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarMenuProps>();
</script>

<template>
  <ul
    data-slot="sidebar-menu"
    :class="
      cn(
        'nx:m-0 nx:flex nx:w-full nx:min-w-0 nx:list-none nx:flex-col nx:gap-px nx:p-0',
        props.class
      )
    "
  >
    <slot />
  </ul>
</template>
