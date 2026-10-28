<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarHeaderProps>();
</script>

<template>
  <div
    data-slot="sidebar-header"
    :class="cn('nx:flex nx:flex-col nx:gap-2 nx:p-2', props.class)"
  >
    <slot />
  </div>
</template>
