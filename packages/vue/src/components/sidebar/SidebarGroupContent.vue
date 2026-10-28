<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarGroupContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SidebarGroupContentProps>();
</script>

<template>
  <div
    data-slot="sidebar-group-content"
    :class="cn('nx:w-full nx:typography-body-default', props.class)"
  >
    <slot />
  </div>
</template>
