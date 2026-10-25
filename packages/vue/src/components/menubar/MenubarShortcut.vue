<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MenubarShortcutProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarShortcutProps>();
</script>

<template>
  <span
    data-slot="menubar-shortcut"
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
