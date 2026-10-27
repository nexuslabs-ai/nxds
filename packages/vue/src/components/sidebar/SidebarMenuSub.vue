<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuSubProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarMenuSubProps>();
</script>

<template>
  <ul
    data-slot="sidebar-menu-sub"
    :class="
      cn(
        'nx:my-0 nx:mr-0 nx:ml-3.5 nx:flex nx:min-w-0 nx:list-none nx:translate-x-px nx:flex-col nx:gap-px nx:border-l-default nx:border-nav-border nx:pl-2.5 nx:py-0.5',
        'nx:group-data-[collapsible=icon]:hidden',
        props.class
      )
    "
  >
    <slot />
  </ul>
</template>
