<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SelectLabel,
  type SelectLabelProps as RekaSelectLabelProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SelectLabelProps extends RekaSelectLabelProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SelectLabelProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <SelectLabel
    v-bind="delegated"
    data-slot="select-label"
    :class="cn('nx:px-2 nx:py-1.5 nx:typography-label-default', props.class)"
  >
    <slot />
  </SelectLabel>
</template>
