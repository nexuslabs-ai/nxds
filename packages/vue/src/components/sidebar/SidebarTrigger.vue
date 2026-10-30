<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { HTMLAttributes } from 'vue';

import { IconLayoutSidebar } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';

import { useSidebar } from '.';

export interface SidebarTriggerProps extends Omit<
  ButtonProps,
  'class' | 'iconOnly' | 'asChild'
> {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarTriggerProps>(), {
  as: 'button',
  variant: 'ghost',
  loading: false,
  type: 'button',
});

const delegated = reactiveOmit(props, 'class');

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    v-bind="delegated"
    icon-only
    data-slot="sidebar-trigger"
    :class="cn('nx:size-7', props.class)"
    @click="toggleSidebar"
  >
    <template #start-icon><IconLayoutSidebar /></template>Toggle Sidebar</Button
  >
</template>
