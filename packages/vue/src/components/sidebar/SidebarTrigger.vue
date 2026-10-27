<script setup lang="ts">
import { IconLayoutSidebar } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import type { HTMLAttributes, VNode } from 'vue';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';

import { useSidebar } from '.';

export interface SidebarTriggerProps extends Omit<ButtonProps, 'class'> {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarTriggerProps>(), {
  as: 'button',
  variant: 'ghost',
  size: 'icon',
  loading: false,
  type: 'button',
});

const slots = defineSlots<{
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();

const delegated = reactiveOmit(props, 'class');

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    v-bind="delegated"
    data-slot="sidebar-trigger"
    :class="cn('nx:size-7', props.class)"
    @click="toggleSidebar"
  >
    <template v-if="slots['start-icon']" #start-icon>
      <slot name="start-icon" />
    </template>
    <IconLayoutSidebar />
    <span class="nx:sr-only">Toggle Sidebar</span>
    <template v-if="slots['end-icon']" #end-icon>
      <slot name="end-icon" />
    </template>
  </Button>
</template>
