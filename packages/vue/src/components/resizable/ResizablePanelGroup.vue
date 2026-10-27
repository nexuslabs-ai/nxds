<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SplitterGroup,
  type SplitterGroupProps,
  useForwardProps,
} from 'reka-ui';
import { defineComponent, type PropType, watch } from 'vue';

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
  /**
   * Called with each panel's size, as a percentage, while the layout changes.
   */
  'layout-change': [layout: number[]];
}>();

const delegated = reactiveOmit(props, 'orientation');
const forwarded = useForwardProps(delegated);

// Reka's `layout` event reports `px` panels in pixels. Its slot's layout is
// always percentages, so the emit watches that instead.
const LayoutWatcher = defineComponent({
  props: { layout: { type: Array as PropType<number[]>, required: true } },
  setup(watcherProps) {
    watch(
      () => watcherProps.layout,
      (layout) => emits('layout-change', layout)
    );
    return () => null;
  },
});
</script>

<template>
  <SplitterGroup
    v-slot="slotProps"
    v-bind="forwarded"
    :direction="orientation"
    data-slot="resizable-panel-group"
  >
    <slot v-bind="slotProps" />
    <LayoutWatcher :layout="slotProps.layout" />
  </SplitterGroup>
</template>
