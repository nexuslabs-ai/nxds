<script setup lang="ts">
import { CommandGroup, type CommandGroupProps } from '../command';

export type MultiSelectGroupProps = CommandGroupProps;

const props = withDefaults(defineProps<MultiSelectGroupProps>(), {
  forceMount: false,
});
</script>

<template>
  <CommandGroup v-bind="props" data-slot="multi-select-group">
    <slot />
  </CommandGroup>
</template>
