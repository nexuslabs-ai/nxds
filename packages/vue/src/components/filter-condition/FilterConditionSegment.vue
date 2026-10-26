<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

export interface FilterConditionSegmentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FilterConditionSegmentProps>();
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    data-slot="filter-condition-segment"
    :class="
      cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'nx:h-(--nx-spacing-8) nx:min-w-0 nx:rounded-none nx:border-s-0 nx:active:scale-100 nx:focus-visible:relative nx:focus-visible:z-10',
        props.class
      )
    "
  >
    <span class="nx:truncate"><slot /></span>
    <IconChevronDown aria-hidden="true" class="nx:text-muted-foreground" />
  </button>
</template>
