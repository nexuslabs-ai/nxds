<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SelectSeparator,
  type SelectSeparatorProps as RekaSelectSeparatorProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SelectSeparatorProps extends RekaSelectSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SelectSeparatorProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <SelectSeparator
    v-bind="delegated"
    data-slot="select-separator"
    :class="
      cn('nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha', props.class)
    "
  />
</template>
