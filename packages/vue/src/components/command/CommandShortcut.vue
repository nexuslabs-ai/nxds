<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CommandShortcutProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CommandShortcutProps>();
</script>

<template>
  <span
    data-slot="command-shortcut"
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
