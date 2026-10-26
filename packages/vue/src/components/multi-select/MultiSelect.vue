<script setup lang="ts">
import { PopoverRoot } from 'reka-ui';
import { computed, provide, ref, type VNode } from 'vue';

import { flattenedNodes } from '../../lib/slots';

import MultiSelectItem from './MultiSelectItem.vue';

import { MultiSelectKey } from '.';

export interface MultiSelectProps {
  /**
   * Controlled selected values.
   */
  values?: string[];
  /**
   * Initial selected values for uncontrolled usage.
   */
  defaultValues?: string[];
}

const props = defineProps<MultiSelectProps>();
const emit = defineEmits<{
  /**
   * Called with the new selected values when the selection changes.
   */
  'values-change': [values: string[]];
}>();
const slots = defineSlots<{ default?: () => VNode[] }>();

function toggleValue(values: Set<string>, value: string) {
  const next = new Set(values);

  // Set.delete returns true when the value was present (and removes it), so a
  // failed delete means it wasn't selected — add it instead.
  if (!next.delete(value)) next.add(value);

  return next;
}

type Slots = Record<string, (() => VNode[]) | undefined>;

/**
 * Walks the slot's nodes and maps each option's `value` to the label its chip
 * shows — the `badge-label` slot, falling back to the option content. The
 * options sit in a closed popover, so they can't report their labels
 * themselves.
 */
function itemLabels(
  nodes: VNode[] | undefined,
  labels = new Map<string, () => VNode[]>()
) {
  for (const node of flattenedNodes(nodes)) {
    const children = node.children;
    if (node.type === MultiSelectItem) {
      const itemSlots = children as Slots | null;
      const label = itemSlots?.['badge-label'] ?? itemSlots?.default;
      if (label) labels.set(String(node.props?.value), label);
      continue;
    }
    if (Array.isArray(children)) itemLabels(children as VNode[], labels);
    else if (children && typeof children === 'object') {
      itemLabels((children as Slots).default?.(), labels);
    }
  }
  return labels;
}

const open = ref(false);
const uncontrolled = ref(new Set(props.values ?? props.defaultValues));

const selectedValues = computed(() =>
  props.values ? new Set(props.values) : uncontrolled.value
);

function toggle(value: string) {
  const nextValues = toggleValue(selectedValues.value, value);

  if (props.values === undefined) uncontrolled.value = nextValues;
  emit('values-change', [...nextValues]);
}

provide(MultiSelectKey, {
  open,
  selectedValues,
  labels: () => itemLabels(slots.default?.()),
  toggle,
});
</script>

<template>
  <PopoverRoot v-model:open="open">
    <slot />
  </PopoverRoot>
</template>
