<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CommandLoadingProps {
  /** Loading progress from 0 to 100, when it is known. */
  progress?: number;
  /** Accessible name for the progress bar. */
  label?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CommandLoadingProps>(), {
  label: 'Loading...',
});
</script>

<template>
  <div
    data-slot="command-loading"
    cmdk-loading
    role="progressbar"
    :aria-valuenow="progress"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="label"
    :class="
      cn(
        'nx:px-3 nx:py-2.5',
        'nx:*:aria-hidden:flex nx:*:aria-hidden:items-center nx:*:aria-hidden:gap-3',
        'nx:typography-body-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <div aria-hidden="true">
      <slot />
    </div>
  </div>
</template>
