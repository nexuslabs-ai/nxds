<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  injectToolbarRootContext,
  Separator,
  type ToolbarSeparatorProps as RekaToolbarSeparatorProps,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ToolbarSeparatorProps extends RekaToolbarSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ToolbarSeparatorProps>();

const delegated = reactiveOmit(props, 'class');

// A separator runs across the toolbar, as Radix draws it; Reka's
// ToolbarSeparator takes the toolbar's own orientation.
const toolbar = injectToolbarRootContext();
const orientation = computed(() =>
  toolbar.orientation.value === 'horizontal' ? 'vertical' : 'horizontal'
);
</script>

<template>
  <Separator
    v-bind="delegated"
    data-slot="toolbar-separator"
    :orientation="orientation"
    :class="
      cn(
        'nx:shrink-0 nx:bg-border-default nx:data-[orientation=vertical]:h-5 nx:data-[orientation=vertical]:w-px nx:data-[orientation=horizontal]:h-px nx:data-[orientation=horizontal]:w-full',
        props.class
      )
    "
  />
</template>
