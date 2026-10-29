<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';

import { IconCheck } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { CommandItem, type CommandItemProps } from '../command';

export interface ComboboxItemProps extends CommandItemProps {
  /**
   * Marks the option as the current selection with a check.
   */
  selected?: boolean;
}

const props = withDefaults(defineProps<ComboboxItemProps>(), {
  selected: false,
  disabled: false,
  forceMount: undefined,
});
const emit = defineEmits<{ select: [value: string] }>();

const delegated = reactiveOmit(props, 'selected');
</script>

<template>
  <CommandItem
    v-bind="delegated"
    data-slot="combobox-item"
    @select="emit('select', $event)"
  >
    <slot />
    <IconCheck
      aria-hidden="true"
      data-slot="combobox-item-indicator"
      :class="
        cn(
          'nx:ml-auto nx:transition-opacity',
          selected ? 'nx:opacity-100' : 'nx:opacity-0'
        )
      "
    />
  </CommandItem>
</template>
