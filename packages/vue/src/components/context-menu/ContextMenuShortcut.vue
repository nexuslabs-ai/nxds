<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ContextMenuShortcutProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ContextMenuShortcutProps>();
</script>

<template>
  <span
    data-slot="context-menu-shortcut"
    :class="
      cn(
        'nx:ml-auto nx:typography-shortcut nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
