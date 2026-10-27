<script setup lang="ts">
import { CommandInput, type CommandInputProps } from '../command';

export type ComboboxInputProps = CommandInputProps;

const props = defineProps<ComboboxInputProps>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <CommandInput
    v-bind="props"
    data-slot="combobox-input"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
