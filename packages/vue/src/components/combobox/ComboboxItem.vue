<script setup lang="ts">
import { IconCheck } from '@tabler/icons-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { CommandItem } from '../command';

export interface ComboboxItemProps {
  /**
   * Marks the option as the current selection with a check.
   */
  selected?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ComboboxItemProps>(), {
  selected: false,
});
</script>

<template>
  <CommandItem data-slot="combobox-item" :class="props.class">
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
