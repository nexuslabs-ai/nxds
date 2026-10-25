<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DropdownMenuShortcutProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuShortcutProps>();
</script>

<template>
  <span
    data-slot="dropdown-menu-shortcut"
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
