<script lang="ts">
import type { FilterGroup, FilterRule } from '../../lib/filter-model';

function nodeIds(node: FilterGroup | FilterRule): string[] {
  if (node.kind === 'rule') return [node.id];
  return [node.id, ...node.children.flatMap(nodeIds)];
}

// Restored trees can already hold IDs from an earlier page load, so skip any in use.
let nodeCount = 0;
function createNodeId(prefix: string, taken: ReadonlySet<string>) {
  let id: string;
  do {
    nodeCount += 1;
    id = `${prefix}${nodeCount}`;
  } while (taken.has(id));
  return id;
}
</script>

<script setup lang="ts">
import { computed, type HTMLAttributes, ref, useId } from 'vue';

import { type FilterField, getFilterErrors } from '../../lib/filter-model';
import { cn } from '../../lib/utils';

import GroupEditor from './GroupEditor.vue';

export interface FilterBuilderProps {
  fields: readonly FilterField[];
  value: FilterGroup;
  disabled?: boolean;
  /** Limits how deep new groups go, with the root at zero. Deeper groups already in the tree show as invalid. */
  maxDepth?: number;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<FilterBuilderProps>(), {
  disabled: false,
  maxDepth: 3,
});
const emit = defineEmits<{ 'value-change': [value: FilterGroup] }>();

const idPrefix = useId();
const untouched = ref<ReadonlySet<string>>(new Set());

// A newly added rule stays quiet until it is edited; the application still sees its errors.
const errors = computed(() =>
  getFilterErrors(props.value, props.fields, props.maxDepth).filter(
    (error) => !untouched.value.has(error.id)
  )
);

function createId(kind: FilterRule['kind'] | FilterGroup['kind']) {
  const id = createNodeId(idPrefix, new Set(nodeIds(props.value)));
  if (kind === 'rule') untouched.value = new Set(untouched.value).add(id);
  return id;
}

function markEdited(id: string) {
  if (!untouched.value.has(id)) return;
  const next = new Set(untouched.value);
  next.delete(id);
  untouched.value = next;
}
</script>

<template>
  <div
    v-bind="{ ...$attrs, 'aria-label': undefined }"
    data-slot="filter-builder"
    :data-disabled="disabled || undefined"
    :class="
      cn(
        'nx:@container/builder nx:w-full nx:min-w-0 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-4',
        props.class
      )
    "
  >
    <GroupEditor
      :fields="fields"
      :value="value"
      :disabled="disabled"
      :depth="0"
      :max-depth="maxDepth"
      :errors="errors"
      :label="($attrs['aria-label'] as string | undefined) ?? 'Filters'"
      :create-id="createId"
      @value-change="emit('value-change', $event)"
      @rule-edited="markEdited"
    />
  </div>
</template>
