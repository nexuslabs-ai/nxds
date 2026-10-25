<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  injectToggleGroupRootContext,
  ToggleGroupItem,
  type ToggleGroupItemProps as RekaToggleGroupItemProps,
  useForwardProps,
} from 'reka-ui';
import { computed, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import { type ToggleVariants, toggleVariants } from '../toggle';

import { joinedItem, ToggleGroupKey } from '.';

export interface ToggleGroupItemProps extends Omit<
  RekaToggleGroupItemProps,
  'value'
> {
  /** Value the group reports while this item is pressed. */
  value: string;
  variant?: ToggleVariants['variant'];
  size?: ToggleVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = defineProps<ToggleGroupItemProps>();

const group = inject(ToggleGroupKey)!;
const root = injectToggleGroupRootContext();

const variant = computed(() => props.variant ?? group.variant);
const size = computed(() => props.size ?? group.size);

// A single-select group is a radio group, as Radix renders it: each item
// reports aria-checked instead of Reka's aria-pressed.
const selectionAttrs = computed(() => {
  if (!root.isSingle.value) return {};
  return {
    role: 'radio',
    'aria-checked': root.modelValue.value === props.value,
    'aria-pressed': undefined,
  };
});

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ToggleGroupItem
    v-bind="{ ...forwarded, ...selectionAttrs }"
    :class="
      cn(
        toggleVariants({ variant, size }),
        'nx:min-w-0 nx:shrink-0',
        group.spacing === 0 && [joinedItem.base, joinedItem[group.orientation]],
        props.class
      )
    "
    data-slot="toggle-group-item"
    :data-variant="variant"
    :data-size="size"
    :data-spacing="group.spacing"
    :data-orientation="group.orientation"
  >
    <slot />
  </ToggleGroupItem>
</template>
