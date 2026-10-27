<script setup lang="ts">
import { CommandList, type CommandListProps } from '../command';

export type ComboboxListProps = CommandListProps;

const props = defineProps<ComboboxListProps>();
</script>

<template>
  <CommandList v-bind="props" data-slot="combobox-list">
    <slot />
  </CommandList>
</template>
