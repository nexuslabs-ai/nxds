<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { type PopoverContentEmits, useForwardPropsEmits } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Command } from '../command';
import { PopoverContent, type PopoverContentProps } from '../popover';

export interface ComboboxContentProps extends Omit<
  PopoverContentProps,
  'class'
> {
  /**
   * Accessible name for the search field and popover. Use the field's label text.
   */
  label?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ComboboxContentProps>(), {
  align: 'start',
  sideOffset: 4,
  label: 'Options',
});
const emits = defineEmits<PopoverContentEmits>();

const delegated = reactiveOmit(props, 'class', 'label');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <PopoverContent
    v-bind="forwarded"
    data-slot="combobox-content"
    :aria-label="label"
    :class="
      cn('nx:w-(--reka-popover-trigger-width) nx:min-w-48 nx:p-0', props.class)
    "
  >
    <Command data-slot="combobox" :label="label" class="nx:bg-transparent">
      <slot />
    </Command>
  </PopoverContent>
</template>
