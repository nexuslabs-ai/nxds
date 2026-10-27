<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

export interface FilterChipProps {
  /** Names the action, field and full value, such as "Remove status filter: Active". */
  ariaLabel: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FilterChipProps>();
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-slot="filter-chip"
    :aria-label="ariaLabel"
    :class="
      cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:max-w-full nx:min-w-0 nx:justify-start nx:active:scale-100',
        props.class
      )
    "
  >
    <span data-slot="filter-chip-label" class="nx:min-w-0 nx:truncate">
      <slot />
    </span>
    <IconX aria-hidden="true" />
  </button>
</template>
