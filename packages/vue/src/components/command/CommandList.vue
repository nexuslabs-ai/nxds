<script setup lang="ts">
import { ListboxContent } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectCommand } from '.';

export interface CommandListProps {
  /** Accessible name for the list. */
  label?: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CommandListProps>(), {
  label: 'Suggestions',
});

const command = injectCommand();
</script>

<template>
  <!-- The child's attributes win over Reka's, so the list reads as cmdk's: no orientation or multiselect state. -->
  <ListboxContent as-child>
    <div
      v-bind="{ 'data-slot': 'command-list', ...$attrs }"
      :id="command.listId"
      cmdk-list
      role="listbox"
      tabindex="-1"
      :aria-label="label"
      :aria-orientation="undefined"
      :aria-multiselectable="undefined"
      :data-orientation="undefined"
      :class="
        cn(
          'nx:max-h-[300px] nx:overflow-y-auto nx:overflow-x-hidden nx:scroll-py-2',
          props.class
        )
      "
    >
      <div cmdk-list-sizer>
        <slot />
      </div>
    </div>
  </ListboxContent>
</template>
