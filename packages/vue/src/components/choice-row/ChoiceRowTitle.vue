<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ChoiceRowTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ChoiceRowTitleProps>();
</script>

<template>
  <div
    data-slot="choice-row-title"
    :class="
      cn(
        'nx:min-w-0 nx:flex-1 nx:typography-label-default nx:text-foreground nx:group-has-[:disabled]/choice-row:text-disabled-foreground',
        props.class
      )
    "
  >
    <!-- An unfilled <slot /> still renders fragment anchors, so the title would not be an empty element. -->
    <slot v-if="$slots.default" />
  </div>
</template>
