<script setup lang="ts" generic="Value extends string">
import { computed, type HTMLAttributes, type VNode } from 'vue';

import { cn } from '../../lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../select';

const props = defineProps<{
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  class?: HTMLAttributes['class'];
}>();
const emit = defineEmits<{ 'value-change': [value: Value] }>();
defineSlots<{ leading?: () => VNode[] }>();

const available = computed(() =>
  props.options.some((option) => option.value === props.value)
);

function select(next: unknown) {
  const option = props.options.find((item) => item.value === next);
  if (option) emit('value-change', option.value);
}
</script>

<template>
  <Select
    :model-value="value"
    :disabled="disabled"
    @update:model-value="select"
  >
    <SelectTrigger
      :aria-label="label"
      :aria-invalid="invalid"
      :aria-describedby="describedBy"
      :class="
        cn(
          'nx:h-(--nx-spacing-8) nx:w-auto nx:min-w-0 nx:max-w-full nx:px-2.5 nx:[&>span]:flex-1 nx:[&>span]:text-start',
          props.class
        )
      "
    >
      <slot name="leading" />
      <SelectValue v-if="!available && value"
        >Unavailable selection</SelectValue
      >
      <SelectValue v-else placeholder="Choose…" />
    </SelectTrigger>
    <SelectContent class="nx:max-w-(--reka-select-content-available-width)">
      <template v-for="option in options" :key="option.value">
        <SelectItem v-if="option.value !== ''" :value="option.value">
          {{ option.label }}
        </SelectItem>
      </template>
    </SelectContent>
  </Select>
</template>
