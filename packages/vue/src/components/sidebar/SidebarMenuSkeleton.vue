<script setup lang="ts">
import { type HTMLAttributes, useId } from 'vue';

import { cn } from '../../lib/utils';
import { Skeleton } from '../skeleton';

export interface SidebarMenuSkeletonProps {
  /**
   * Adds an icon-sized block before the text bar.
   */
  showIcon?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarMenuSkeletonProps>(), {
  showIcon: false,
});

// Vary the text-bar width (50–90%) so a stack of skeletons looks organic.
// Seed from the SSR-stable useId() so server and client agree.
const seed = [...useId()].reduce((sum, char) => sum + char.charCodeAt(0), 0);
const width = `${50 + (seed % 41)}%`;
</script>

<template>
  <div
    data-slot="sidebar-menu-skeleton"
    :class="
      cn(
        'nx:flex nx:h-8 nx:items-center nx:gap-2 nx:rounded-md nx:px-2',
        props.class
      )
    "
  >
    <Skeleton
      v-if="showIcon"
      data-slot="sidebar-menu-skeleton-icon"
      class="nx:size-4 nx:rounded-md"
    />
    <Skeleton
      data-slot="sidebar-menu-skeleton-text"
      class="nx:h-4 nx:max-w-(--skeleton-width) nx:flex-1"
      :style="{ '--skeleton-width': width }"
    />
  </div>
</template>
