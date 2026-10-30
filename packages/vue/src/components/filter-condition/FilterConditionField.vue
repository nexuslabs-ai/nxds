<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FilterConditionFieldProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FilterConditionFieldProps>();
</script>

<template>
  <span
    v-bind="$attrs"
    data-slot="filter-condition-field"
    :class="
      cn(
        'nx:inline-flex nx:h-(--nx-spacing-8) nx:shrink-0 nx:items-center nx:gap-2 nx:[&_svg]:size-3.5 nx:[&_svg]:[--nx-icon-size:var(--nx-spacing-3_5)] nx:[&_svg]:shrink-0 nx:icon-stroke nx:rounded-s-base nx:border-default nx:border-border-default nx:bg-container nx:px-2.5 nx:typography-label-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </span>
</template>
