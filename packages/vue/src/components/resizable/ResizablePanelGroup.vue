<script setup lang="ts">
import {
  SplitterGroup,
  type SplitterGroupEmits,
  type SplitterGroupProps,
  useForwardPropsEmits,
} from 'reka-ui';

export type ResizablePanelGroupProps = SplitterGroupProps;

const props = defineProps<SplitterGroupProps>();
const emits = defineEmits<SplitterGroupEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <SplitterGroup
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="resizable-panel-group"
  >
    <slot v-bind="slotProps" />
  </SplitterGroup>
</template>
