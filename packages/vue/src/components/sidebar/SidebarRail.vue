<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { useSidebar } from '.';

export interface SidebarRailProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarRailProps>();

const { toggleSidebar } = useSidebar();
</script>

<template>
  <button
    data-slot="sidebar-rail"
    aria-label="Toggle Sidebar"
    tabindex="-1"
    title="Toggle Sidebar"
    :class="
      cn(
        'nx:absolute nx:inset-y-0 nx:z-sticky nx:hidden nx:w-4 nx:border-0 nx:bg-transparent nx:p-0 nx:-translate-x-1/2 nx:transition-[left,right,translate,background-color] nx:duration-fast nx:ease-linear nx:group-data-[side=left]:-right-4 nx:group-data-[side=right]:left-0 nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-0.5 nx:hover:after:bg-nav-border nx:md:flex',
        'nx:in-data-[side=left]:cursor-w-resize nx:in-data-[side=right]:cursor-e-resize',
        'nx:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize nx:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'nx:group-data-[collapsible=offcanvas]:translate-x-0 nx:group-data-[collapsible=offcanvas]:after:left-full nx:hover:group-data-[collapsible=offcanvas]:bg-nav-background',
        'nx:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        'nx:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        props.class
      )
    "
    @click="toggleSidebar"
  />
</template>
