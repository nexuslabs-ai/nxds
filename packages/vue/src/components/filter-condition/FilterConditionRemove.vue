<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { IconX } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

export interface FilterConditionRemoveProps {
  /** Defines a string value that labels the current element. */
  ariaLabel: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FilterConditionRemoveProps>();
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-slot="filter-condition-remove"
    :aria-label="ariaLabel"
    :class="
      cn(
        buttonVariants({ variant: 'outline', size: 'icon-sm' }),
        'nx:size-(--nx-spacing-8) nx:shrink-0 nx:rounded-s-none nx:border-s-0 nx:text-muted-foreground nx:active:scale-100 nx:focus-visible:relative nx:focus-visible:z-10',
        props.class
      )
    "
  >
    <IconX aria-hidden="true" />
  </button>
</template>
