<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuBadgeProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarMenuBadgeProps>();
</script>

<template>
  <div
    data-slot="sidebar-menu-badge"
    :class="
      cn(
        'nx:pointer-events-none nx:absolute nx:right-1 nx:flex nx:h-5 nx:min-w-5 nx:items-center nx:justify-center nx:rounded-md nx:px-1 nx:typography-label-small nx:text-nav-foreground nx:tabular-nums nx:select-none',
        'nx:peer-data-[size=sm]/menu-button:top-1',
        'nx:peer-data-[size=default]/menu-button:top-1.5',
        'nx:peer-data-[size=lg]/menu-button:top-2.5',
        'nx:group-data-[collapsible=icon]:hidden',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
