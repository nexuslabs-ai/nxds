<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  injectToggleGroupRootContext,
  ToolbarToggleItem,
  type ToolbarToggleItemProps as RekaToolbarToggleItemProps,
  useForwardProps,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';
import { useToggleGroupSelectionAttrs } from '../toggle-group/toggle-group-selection';

export interface ToolbarToggleItemProps extends Omit<
  RekaToolbarToggleItemProps,
  'value'
> {
  /** Value the group reports while this item is pressed. */
  value: string;
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToolbarToggleItemProps>(), {
  size: 'sm',
});

const selectionAttrs = useToggleGroupSelectionAttrs(() => props.value);

// Reka's toolbar wrapper reads only the item's own disabled, so an item of a
// disabled group stays in the arrow-key order without data-disabled.
const group = injectToggleGroupRootContext();
const disabled = computed(() => group.disabled?.value || props.disabled);

const delegated = reactiveOmit(props, 'class', 'size');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ToolbarToggleItem
    v-bind="{ ...forwarded, ...selectionAttrs }"
    data-slot="toolbar-toggle-item"
    :disabled="disabled"
    :data-size="size"
    :class="
      cn(
        buttonVariants({ variant: 'ghost', size }),
        'nx:data-[state=on]:bg-primary-subtle nx:data-[state=on]:text-primary-subtle-foreground nx:data-[state=on]:hover:bg-primary-subtle-hover nx:data-[state=on]:active:bg-primary-subtle-active',
        props.class
      )
    "
  >
    <slot />
  </ToolbarToggleItem>
</template>
