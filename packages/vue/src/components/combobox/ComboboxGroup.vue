<script setup lang="ts">
import { CommandGroup, type CommandGroupProps } from '../command';

export type ComboboxGroupProps = CommandGroupProps;

const props = withDefaults(defineProps<ComboboxGroupProps>(), {
  forceMount: false,
});
</script>

<template>
  <CommandGroup v-bind="props" data-slot="combobox-group">
    <slot />
  </CommandGroup>
</template>
