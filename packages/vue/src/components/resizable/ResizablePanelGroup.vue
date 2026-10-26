<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SplitterGroup,
  type SplitterGroupProps,
  useForwardProps,
} from 'reka-ui';

export interface ResizablePanelGroupProps extends Omit<
  SplitterGroupProps,
  'direction'
> {
  /**
   * The axis the panels split along.
   */
  orientation?: 'horizontal' | 'vertical';
}

const props = withDefaults(defineProps<ResizablePanelGroupProps>(), {
  orientation: 'horizontal',
});
const emits = defineEmits<{
  'layout-change': [layout: number[]];
}>();

const delegated = reactiveOmit(props, 'orientation');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <SplitterGroup
    v-slot="slotProps"
    v-bind="forwarded"
    :direction="orientation"
    data-slot="resizable-panel-group"
    @layout="emits('layout-change', $event)"
  >
    <slot v-bind="slotProps" />
  </SplitterGroup>
</template>
