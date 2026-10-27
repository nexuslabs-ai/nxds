<script setup lang="ts">
import { CommandSeparator, type CommandSeparatorProps } from '../command';

export type ComboboxSeparatorProps = CommandSeparatorProps;

const props = withDefaults(defineProps<ComboboxSeparatorProps>(), {
  alwaysRender: false,
});
</script>

<template>
  <CommandSeparator v-bind="props" data-slot="combobox-separator" />
</template>
