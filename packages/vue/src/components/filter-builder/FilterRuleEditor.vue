<script setup lang="ts">
import { computed, useId } from 'vue';

import {
  changeFilterOperator,
  emptyFilterRule,
  type FilterField,
  type FilterOperator,
  filterOperatorLabels,
  type FilterRule,
  getFilterOperators,
  isValuelessOperator,
} from '../../lib/filter-model';
import {
  IconCalendar,
  IconHash,
  IconLetterCase,
  IconList,
  IconX,
} from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button } from '../button';

import Picker from './Picker.vue';
import RuleValue from './RuleValue.vue';

// Edits one controlled condition; numeric and date operands remain draft strings.
const props = defineProps<{
  value: FilterRule;
  fields: readonly FilterField[];
  disabled?: boolean;
  error?: string;
}>();
const emit = defineEmits<{
  'value-change': [value: FilterRule];
  remove: [];
}>();

const fieldTypeIcons = {
  text: IconLetterCase,
  number: IconHash,
  date: IconCalendar,
  choice: IconList,
} satisfies Record<FilterField['type'], unknown>;

const errorId = useId();
const field = computed(() =>
  props.fields.find((item) => item.id === props.value.field)
);
const operators = computed(() =>
  field.value ? getFilterOperators(field.value) : []
);
const fieldOptions = computed(() =>
  props.fields
    .filter((item) => getFilterOperators(item).length)
    .map((item) => ({ value: item.id, label: item.label }))
);
const operatorOptions = computed(() =>
  operators.value.map((operator) => ({
    value: operator,
    label: filterOperatorLabels[operator],
  }))
);

function changeField(fieldId: string) {
  const nextField = props.fields.find((item) => item.id === fieldId);
  if (!nextField) return;
  const operator = getFilterOperators(nextField)[0];
  if (!operator) return;
  emit('value-change', emptyFilterRule(props.value.id, fieldId, operator));
}

function changeOperator(operator: FilterOperator) {
  emit('value-change', changeFilterOperator(props.value, operator));
}
</script>

<template>
  <div data-slot="filter-rule-editor" class="nx:@container/rule nx:min-w-0">
    <div class="nx:flex nx:min-w-0 nx:items-start nx:gap-1">
      <div
        class="nx:grid nx:min-w-0 nx:flex-1 nx:grid-cols-1 nx:gap-1.5 nx:@sm/rule:grid-cols-2 nx:@lg/rule:gap-0 nx:@lg/rule:grid-cols-[minmax(0,1fr)_max-content_minmax(0,1.3fr)] nx:[&_button:focus-visible]:relative nx:[&_button:focus-visible]:z-10 nx:[&_input:focus-visible]:relative nx:[&_input:focus-visible]:z-10"
      >
        <Picker
          class="nx:w-full nx:bg-container nx:@lg/rule:rounded-e-none"
          label="Field"
          :value="value.field"
          :options="fieldOptions"
          :disabled="disabled"
          :invalid="!field"
          :described-by="error ? errorId : undefined"
          @value-change="changeField"
        >
          <template v-if="field" #leading>
            <component
              :is="fieldTypeIcons[field.type]"
              aria-hidden="true"
              class="nx:size-3.5 nx:[--nx-icon-size:var(--nx-spacing-3_5)] nx:shrink-0 nx:text-muted-foreground"
            />
          </template>
        </Picker>
        <Picker
          :class="
            cn(
              'nx:w-full nx:@lg/rule:rounded-s-none nx:@lg/rule:border-s-0',
              !isValuelessOperator(value.operator) &&
                'nx:@lg/rule:rounded-e-none'
            )
          "
          :label="`${field?.label ?? 'Condition'} operator`"
          :value="value.operator"
          :options="operatorOptions"
          :disabled="disabled || !field"
          :invalid="!operators.includes(value.operator)"
          :described-by="error ? errorId : undefined"
          @value-change="changeOperator"
        />
        <div
          v-if="field"
          class="nx:min-w-0 nx:@sm/rule:col-span-2 nx:@lg/rule:col-span-1 nx:@lg/rule:[&_input]:rounded-s-none nx:@lg/rule:[&_input]:border-s-0 nx:@lg/rule:[&_button]:rounded-s-none nx:@lg/rule:[&_button]:border-s-0"
        >
          <RuleValue
            :field="field"
            :rule="value"
            :disabled="disabled"
            :error-id="error ? errorId : undefined"
            :invalid="!!error"
            @value-change="emit('value-change', $event)"
          />
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        class="nx:size-(--nx-spacing-8) nx:shrink-0 nx:text-muted-foreground"
        :aria-label="`Remove ${field?.label ?? 'unavailable'} condition`"
        :disabled="disabled"
        @click="emit('remove')"
      >
        <IconX aria-hidden="true" />
      </Button>
    </div>
    <p
      v-if="error"
      :id="errorId"
      class="nx:mt-1 nx:mb-0 nx:typography-body-small nx:text-error-subtle-foreground"
    >
      {{ error }}
    </p>
  </div>
</template>
