<script lang="ts">
import type { FilterErrorCode } from '../../lib/filter-model';

const errorMessages: Record<Exclude<FilterErrorCode, 'tooDeep'>, string> = {
  duplicateId: 'Each condition and group needs a unique ID.',
  unknownField: 'Choose an available field.',
  unknownOperator: 'Choose an available operator.',
  unexpectedValue: 'This operator takes no value.',
  valueShape: 'Choose a value for this operator.',
  incompleteRange: 'Enter both ends of the range.',
  missingValue: 'Enter a value.',
  invalidNumber: 'Enter a valid number.',
  invalidDate: 'Enter a valid date.',
  unknownOption: 'Choose an available option.',
  reversedRange: 'The start must not be after the end.',
  emptyGroup: 'Add a condition or remove this group.',
};
function errorMessage(code: FilterErrorCode, maxDepth: number) {
  if (code === 'tooDeep')
    return `Use at most ${maxDepth} levels of nested groups.`;
  return errorMessages[code];
}
</script>

<script setup lang="ts">
import { IconPlus, IconX } from '@tabler/icons-vue';
import { computed, useTemplateRef } from 'vue';

import {
  emptyFilterRule,
  type FilterError,
  type FilterField,
  type FilterGroup,
  type FilterRule,
  getFilterOperators,
} from '../../lib/filter-model';
import { cn } from '../../lib/utils';
import { Button } from '../button';

import FilterRuleEditor from './FilterRuleEditor.vue';
import Picker from './Picker.vue';

const props = defineProps<{
  value: FilterGroup;
  fields: readonly FilterField[];
  disabled?: boolean;
  depth: number;
  maxDepth: number;
  errors: FilterError[];
  label: string;
  createId: (kind: FilterRule['kind'] | FilterGroup['kind']) => string;
}>();
const emit = defineEmits<{
  'value-change': [value: FilterGroup];
  remove: [];
  'rule-edited': [id: string];
}>();

const addButton = useTemplateRef<InstanceType<typeof Button>>('add');
let focusId: string | null = null;

const firstField = computed(() =>
  props.fields.find((field) => getFilterOperators(field).length)
);
const groupError = computed(
  () => props.errors.find((error) => error.id === props.value.id)?.code
);

function newRule(): FilterRule {
  const operator = firstField.value
    ? (getFilterOperators(firstField.value)[0] ?? 'is')
    : 'is';
  return emptyFilterRule(
    props.createId('rule'),
    firstField.value?.id ?? '',
    operator
  );
}

function addRule() {
  const rule = newRule();
  focusId = rule.id;
  emit('value-change', {
    ...props.value,
    children: [...props.value.children, rule],
  });
}

function addGroup() {
  const group: FilterGroup = {
    kind: 'group',
    id: props.createId('group'),
    conjunction: 'any',
    children: [newRule()],
  };
  focusId = group.id;
  emit('value-change', {
    ...props.value,
    children: [...props.value.children, group],
  });
}

function replace(next: FilterGroup | FilterRule) {
  if (next.kind === 'rule') emit('rule-edited', next.id);
  emit('value-change', {
    ...props.value,
    children: props.value.children.map((child) =>
      child.id === next.id ? next : child
    ),
  });
}

function remove(id: string) {
  emit('value-change', {
    ...props.value,
    children: props.value.children.filter((child) => child.id !== id),
  });
  (addButton.value?.$el as HTMLElement | undefined)?.focus();
}

function ruleError(id: string) {
  const code = props.errors.find((error) => error.id === id)?.code;
  return code && errorMessage(code, props.maxDepth);
}

// The node an add just created renders once the new value comes back; focus
// its first picker then.
function focusNewNode(node: unknown) {
  if (!(node instanceof HTMLElement) || focusId !== node.dataset.nodeId) return;
  node.querySelector<HTMLButtonElement>('button[role="combobox"]')?.focus();
  focusId = null;
}

function separator(index: number) {
  if (index === 0) return 'Where';
  return props.value.conjunction === 'all' ? 'And' : 'Or';
}
</script>

<template>
  <div
    data-slot="filter-group"
    role="group"
    :aria-label="label"
    :class="
      cn(
        'nx:min-w-0',
        depth > 0 &&
          'nx:rounded-md nx:border-default nx:border-border-default nx:bg-muted-extralight nx:p-3'
      )
    "
  >
    <div class="nx:mb-3 nx:flex nx:items-center nx:gap-2">
      <div
        class="nx:flex nx:min-w-0 nx:flex-1 nx:flex-wrap nx:items-center nx:gap-2"
      >
        <span
          class="nx:shrink-0 nx:@2xl/builder:w-12 nx:typography-body-default nx:text-muted-foreground"
          >Match</span
        >
        <div class="nx:shrink-0">
          <Picker
            class="nx:bg-container"
            :label="`${label} match`"
            :value="value.conjunction"
            :options="[
              { value: 'all', label: 'All' },
              { value: 'any', label: 'Any' },
            ]"
            :disabled="disabled"
            @value-change="
              emit('value-change', { ...value, conjunction: $event })
            "
          />
        </div>
        <span class="nx:typography-body-default nx:text-muted-foreground"
          >conditions</span
        >
      </div>
      <Button
        v-if="depth > 0"
        class="nx:size-(--nx-spacing-8) nx:shrink-0 nx:text-muted-foreground"
        variant="ghost"
        size="icon-sm"
        :aria-label="`Remove ${label}`"
        :disabled="disabled"
        @click="emit('remove')"
      >
        <IconX aria-hidden="true" />
      </Button>
    </div>
    <div class="nx:grid nx:gap-2">
      <div
        v-for="(child, index) in value.children"
        :key="child.id"
        :ref="focusNewNode"
        :data-node-id="child.id"
        class="nx:flex nx:min-w-0 nx:items-start nx:gap-2"
      >
        <span
          aria-hidden="true"
          class="nx:hidden nx:h-(--nx-spacing-8) nx:w-12 nx:shrink-0 nx:@2xl/builder:flex nx:items-center nx:typography-body-default nx:text-muted-foreground"
          >{{ separator(index) }}</span
        >
        <div class="nx:min-w-0 nx:flex-1">
          <GroupEditor
            v-if="child.kind === 'group'"
            :value="child"
            :fields="fields"
            :disabled="disabled"
            :depth="depth + 1"
            :max-depth="maxDepth"
            :errors="errors"
            :label="`${label} group ${index + 1}`"
            :create-id="createId"
            @value-change="replace"
            @remove="remove(child.id)"
            @rule-edited="emit('rule-edited', $event)"
          />
          <FilterRuleEditor
            v-else
            :value="child"
            :fields="fields"
            :disabled="disabled"
            :error="ruleError(child.id)"
            @value-change="replace"
            @remove="remove(child.id)"
          />
        </div>
      </div>
      <p
        v-if="!value.children.length"
        class="nx:m-0 nx:py-2 nx:typography-body-small nx:text-muted-foreground"
      >
        {{
          depth === 0
            ? 'No conditions. All results are included.'
            : 'Add a condition to this group.'
        }}
      </p>
    </div>
    <p
      v-if="groupError"
      class="nx:mt-2 nx:mb-0 nx:typography-body-small nx:text-error-subtle-foreground"
    >
      {{ errorMessage(groupError, maxDepth) }}
    </p>
    <div class="nx:mt-3 nx:flex nx:flex-wrap nx:gap-1">
      <Button
        ref="add"
        size="sm"
        class="nx:h-(--nx-spacing-8) nx:text-muted-foreground"
        variant="ghost"
        :disabled="disabled || !firstField"
        @click="addRule"
      >
        <IconPlus aria-hidden="true" />Add condition</Button
      >
      <Button
        v-if="depth < maxDepth"
        class="nx:h-(--nx-spacing-8) nx:text-muted-foreground"
        variant="ghost"
        :disabled="disabled || !firstField"
        size="sm"
        @click="addGroup"
      >
        <IconPlus aria-hidden="true" />Add group</Button
      >
    </div>
  </div>
</template>
