<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { type PopoverContentEmits, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes, VNode } from 'vue';

import { cn } from '../../lib/utils';
import { Command, CommandEmpty, CommandInput, CommandList } from '../command';
import { PopoverContent, type PopoverContentProps } from '../popover';

export interface MultiSelectContentProps extends Omit<
  PopoverContentProps,
  'class'
> {
  /**
   * Placeholder for the search input.
   */
  searchPlaceholder?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MultiSelectContentProps>(), {
  align: 'start',
  sideOffset: 6,
  searchPlaceholder: 'Search…',
});
const emits = defineEmits<PopoverContentEmits>();
defineSlots<{
  default?: () => VNode[];
  /**
   * Shown when the search matches no options.
   */
  'empty-message'?: () => VNode[];
}>();

const delegated = reactiveOmit(props, 'class', 'searchPlaceholder');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <PopoverContent
    v-bind="forwarded"
    data-slot="multi-select-content"
    aria-label="Options"
    :class="
      cn('nx:w-(--reka-popover-trigger-width) nx:min-w-56 nx:p-0', props.class)
    "
  >
    <Command>
      <CommandInput :placeholder="searchPlaceholder" />
      <CommandList>
        <CommandEmpty>
          <slot name="empty-message">No results found.</slot>
        </CommandEmpty>
        <slot />
      </CommandList>
    </Command>
  </PopoverContent>
</template>
