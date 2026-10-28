<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarMenuItemProps>();
</script>

<template>
  <li
    data-slot="sidebar-menu-item"
    :class="cn('nx:group/menu-item nx:relative', props.class)"
  >
    <slot />
  </li>
</template>
