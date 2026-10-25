<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarSeparator,
  type MenubarSeparatorProps as RekaMenubarSeparatorProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MenubarSeparatorProps extends RekaMenubarSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarSeparatorProps>();

const delegated = reactiveOmit(props, 'class');
</script>

<template>
  <MenubarSeparator
    v-bind="delegated"
    data-slot="menubar-separator"
    :class="
      cn('nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha', props.class)
    "
  />
</template>
