<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ContextMenuSeparator,
  type ContextMenuSeparatorProps as RekaContextMenuSeparatorProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ContextMenuSeparatorProps extends RekaContextMenuSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ContextMenuSeparatorProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <ContextMenuSeparator
    v-bind="delegated"
    data-slot="context-menu-separator"
    :class="
      cn('nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha', props.class)
    "
  />
</template>
