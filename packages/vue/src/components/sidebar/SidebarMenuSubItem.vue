<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuSubItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarMenuSubItemProps>();
</script>

<template>
  <li
    data-slot="sidebar-menu-sub-item"
    :class="cn('nx:group/menu-sub-item nx:relative', props.class)"
  >
    <slot />
  </li>
</template>
