<script setup lang="ts">
import type { FilterField, FilterRule } from '../../lib/filter-model';
import { Input } from '../input';

import MultipleValues from './MultipleValues.vue';
import Picker from './Picker.vue';

defineProps<{
  field: FilterField;
  rule: FilterRule;
  disabled?: boolean;
  errorId?: string;
  invalid: boolean;
}>();
const emit = defineEmits<{ 'value-change': [rule: FilterRule] }>();
</script>

<template>
  <span
    v-if="rule.operator === 'isEmpty' || rule.operator === 'isNotEmpty'"
    class="nx:self-center nx:typography-body-small nx:text-muted-foreground"
  >
    No value needed
  </span>
  <template
    v-else-if="rule.operator === 'isAnyOf' || rule.operator === 'isNoneOf'"
  >
    <MultipleValues
      v-if="field.type === 'choice'"
      :field="field"
      :value="rule.value"
      :disabled="disabled"
      :invalid="invalid"
      :described-by="errorId"
      @value-change="emit('value-change', { ...rule, value: $event })"
    />
  </template>
  <template v-else-if="rule.operator === 'between'">
    <div
      v-if="field.type !== 'choice'"
      class="nx:flex nx:min-w-0 nx:max-w-full nx:flex-wrap nx:items-center nx:gap-2 nx:@lg/rule:flex-nowrap nx:@lg/rule:gap-0 nx:@lg/rule:[&>input]:flex-1 nx:@lg/rule:[&>input:first-child]:rounded-e-none"
    >
      <Input
        size="sm"
        :type="field.type"
        :step="field.type === 'number' ? 'any' : undefined"
        :aria-label="`${field.label} start`"
        placeholder="From"
        :model-value="rule.value[0]"
        :disabled="disabled"
        :aria-invalid="invalid"
        :aria-describedby="errorId"
        class="nx:min-w-0 nx:w-36 nx:max-w-full nx:typography-body-default nx:h-(--nx-spacing-8)"
        @update:model-value="
          emit('value-change', {
            ...rule,
            value: [String($event), rule.value[1]],
          })
        "
      />
      <Input
        size="sm"
        :type="field.type"
        :step="field.type === 'number' ? 'any' : undefined"
        :aria-label="`${field.label} end`"
        placeholder="To"
        :model-value="rule.value[1]"
        :disabled="disabled"
        :aria-invalid="invalid"
        :aria-describedby="errorId"
        class="nx:min-w-0 nx:w-36 nx:max-w-full nx:typography-body-default nx:h-(--nx-spacing-8)"
        @update:model-value="
          emit('value-change', {
            ...rule,
            value: [rule.value[0], String($event)],
          })
        "
      />
    </div>
  </template>
  <Picker
    v-else-if="field.type === 'choice'"
    class="nx:w-full nx:bg-container"
    :label="`${field.label} value`"
    :options="field.options"
    :value="rule.value"
    :disabled="disabled"
    :invalid="invalid"
    :described-by="errorId"
    @value-change="emit('value-change', { ...rule, value: $event })"
  />
  <Input
    v-else
    size="sm"
    :type="field.type"
    :step="field.type === 'number' ? 'any' : undefined"
    :aria-label="`${field.label} value`"
    :placeholder="field.type === 'date' ? undefined : 'Enter a value…'"
    :model-value="rule.value"
    :disabled="disabled"
    :aria-invalid="invalid"
    :aria-describedby="errorId"
    class="nx:min-w-0 nx:w-full nx:max-w-full nx:bg-container nx:typography-body-default nx:h-(--nx-spacing-8)"
    @update:model-value="
      emit('value-change', { ...rule, value: String($event) })
    "
  />
</template>
