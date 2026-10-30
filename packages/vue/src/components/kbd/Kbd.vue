<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface KbdProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<KbdProps>();
</script>

<template>
  <kbd
    data-slot="kbd"
    :class="
      cn(
        'nx:pointer-events-none nx:inline-flex nx:h-5 nx:w-fit nx:min-w-5 nx:items-center nx:justify-center nx:gap-1 nx:rounded-sm nx:bg-muted nx:px-1 nx:typography-label-small nx:text-muted-foreground nx:select-none nx:[&_svg]:size-3 nx:[&_svg]:[--nx-icon-size:var(--nx-spacing-3)] nx:icon-stroke',
        props.class
      )
    "
  >
    <slot />
  </kbd>
</template>
