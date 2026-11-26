<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

export interface FilterChipProps {
  /** What activating the chip does. Screen readers read it before the chip's text, such as "Remove filter: Status: Active". */
  action?: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FilterChipProps>(), {
  action: 'Remove filter',
});
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-slot="filter-chip"
    :class="
      cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:max-w-full nx:min-w-0 nx:justify-start nx:active:scale-100',
        props.class
      )
    "
  >
    <span class="nx:sr-only">{{ props.action }}: </span>
    <span data-slot="filter-chip-label" class="nx:min-w-0 nx:truncate">
      <slot />
    </span>
    <IconX aria-hidden="true" />
  </button>
</template>
