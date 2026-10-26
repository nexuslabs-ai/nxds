<script setup lang="ts">
import {
  SplitterPanel,
  type SplitterPanelEmits,
  type SplitterPanelProps,
  useForwardPropsEmits,
} from 'reka-ui';

export interface ResizablePanelProps extends Omit<
  SplitterPanelProps,
  'defaultSize' | 'minSize' | 'maxSize' | 'collapsedSize' | 'sizeUnit'
> {
  /**
   * Starting size, in `sizeUnit`.
   */
  defaultSize?: number;
  /**
   * Smallest size, in `sizeUnit`.
   */
  minSize?: number;
  /**
   * Largest size, in `sizeUnit`.
   */
  maxSize?: number;
  /**
   * Size when collapsed, in `sizeUnit`.
   */
  collapsedSize?: number;
  /**
   * Unit for every size prop: a percentage of the group, or pixels.
   */
  sizeUnit?: '%' | 'px';
}

const props = withDefaults(defineProps<ResizablePanelProps>(), {
  minSize: 0,
  sizeUnit: '%',
});
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
