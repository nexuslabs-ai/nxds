<script setup lang="ts">
import {
  SplitterPanel,
  type SplitterPanelEmits,
  type SplitterPanelProps,
  useForwardPropsEmits,
} from 'reka-ui';

export type ResizablePanelProps = SplitterPanelProps;

const props = defineProps<SplitterPanelProps>();
const emits = defineEmits<SplitterPanelEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <SplitterPanel
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="resizable-panel"
  >
    <slot v-bind="slotProps" />
  </SplitterPanel>
</template>
