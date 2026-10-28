<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarFooterProps>();
</script>

<template>
  <div
    data-slot="sidebar-footer"
    :class="cn('nx:flex nx:flex-col nx:gap-2 nx:p-2', props.class)"
  >
    <slot />
  </div>
</template>
