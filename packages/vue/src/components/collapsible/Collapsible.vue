<script setup lang="ts">
import {
  CollapsibleRoot,
  type CollapsibleRootEmits,
  type CollapsibleRootProps,
  useForwardPropsEmits,
} from 'reka-ui';

export type CollapsibleProps = CollapsibleRootProps;

const props = withDefaults(defineProps<CollapsibleRootProps>(), {
  open: undefined,
  defaultOpen: undefined,
});
const emits = defineEmits<CollapsibleRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <CollapsibleRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="collapsible"
  >
    <slot v-bind="slotProps" />
  </CollapsibleRoot>
</template>
