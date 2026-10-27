<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue';
import { PopoverTrigger } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectMultiSelect } from '.';

export interface MultiSelectTriggerProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<MultiSelectTriggerProps>();

const { open, selectedValues, toggle } = injectMultiSelect();

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Backspace' && event.key !== 'Delete') return;

  const values = [...selectedValues.value];
  const last = values[values.length - 1];
  if (last !== undefined) toggle(last);
}
</script>

<template>
  <PopoverTrigger as-child>
    <!-- The button's attributes win over Reka's, as the button's props win over Radix's in React. -->
    <button
      v-bind="{
        type: 'button',
        'aria-haspopup': 'listbox',
        'aria-expanded': open,
        'data-slot': 'multi-select-trigger',
        ...$attrs,
      }"
      :class="
        cn(
          'nx:group/multi-select nx:flex nx:h-auto nx:min-h-10 nx:w-full nx:items-center nx:justify-between nx:gap-2 nx:rounded-md nx:border-default nx:border-border-default nx:bg-container nx:text-inherit nx:px-3 nx:py-1.5 nx:typography-body-default nx:whitespace-nowrap nx:transition-field',
          'nx:enabled:hover:bg-container-hover',
          'nx:focus-visible:outline-default nx:focus-visible:outline-focus-default nx:focus-visible:border-focus-default',
          'nx:aria-invalid:border-error-border nx:aria-invalid:focus-visible:outline-focus-error nx:aria-invalid:focus-visible:border-focus-error',
          'nx:disabled:cursor-not-allowed nx:disabled:border-border-disabled nx:disabled:bg-disabled nx:disabled:text-disabled-foreground',
          props.class
        )
      "
      @keydown="handleKeyDown"
    >
      <slot />
      <IconChevronDown
        aria-hidden="true"
        class="nx:size-4 nx:shrink-0 nx:text-muted-foreground nx:group-disabled/multi-select:text-disabled-foreground"
      />
    </button>
  </PopoverTrigger>
</template>
