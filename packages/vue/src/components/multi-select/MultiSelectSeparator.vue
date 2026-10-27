<script setup lang="ts">
import { CommandSeparator, type CommandSeparatorProps } from '../command';

export type MultiSelectSeparatorProps = CommandSeparatorProps;

const props = withDefaults(defineProps<MultiSelectSeparatorProps>(), {
  alwaysRender: false,
});
</script>

<template>
  <CommandSeparator v-bind="props" data-slot="multi-select-separator" />
</template>
