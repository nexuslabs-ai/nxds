<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface FilterConditionProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<FilterConditionProps>();
</script>

<template>
  <div
    v-bind="$attrs"
    data-slot="filter-condition"
    :class="
      cn(
        'nx:inline-flex nx:max-w-full nx:min-w-0 nx:items-stretch',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
