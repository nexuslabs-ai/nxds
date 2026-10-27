<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuSeparator,
  type DropdownMenuSeparatorProps as RekaDropdownMenuSeparatorProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface DropdownMenuSeparatorProps extends RekaDropdownMenuSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuSeparatorProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <DropdownMenuSeparator
    v-bind="delegated"
    data-slot="dropdown-menu-separator"
    :class="
      cn('nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha', props.class)
    "
  />
</template>
