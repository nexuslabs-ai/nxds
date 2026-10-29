<script setup lang="ts">
import { type HTMLAttributes, useAttrs } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<SidebarContentProps>();

const attrs = useAttrs();

// A labelledby reference, when given, names the landmark, so the default
// label is left off rather than emitted beside it.
function ariaLabel() {
  if (attrs['aria-labelledby']) return undefined;
  return (attrs['aria-label'] as string | undefined) ?? 'Sidebar';
}
</script>

<template>
  <nav
    v-bind="{
      'data-slot': 'sidebar-content',
      ...attrs,
      'aria-label': ariaLabel(),
    }"
    :class="
      cn(
        'nx:flex nx:min-h-0 nx:flex-1 nx:flex-col nx:gap-2 nx:overflow-auto nx:group-data-[collapsible=icon]:overflow-hidden',
        props.class
      )
    "
  >
    <slot />
  </nav>
</template>
