<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  type AcceptableValue,
  ToggleGroupRoot,
  type ToggleGroupRootProps,
  useForwardProps,
} from 'reka-ui';
import { type HTMLAttributes, provide } from 'vue';

import { cn } from '../../lib/utils';
import type { ToggleVariants } from '../toggle';

import { ToggleGroupKey } from '.';

/** A step on the spacing scale. Each one has its own `--nx-spacing-*` variable. */
type ToggleGroupSpacing =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 14
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 44
  | 48
  | 52
  | 56
  | 60
  | 64
  | 72
  | 80
  | 96;

export interface ToggleGroupProps extends ToggleGroupRootProps<
  string | string[]
> {
  variant?: ToggleVariants['variant'];
  size?: ToggleVariants['size'];
  /**
   * Gap between items, in spacing-scale units. `0` joins them into one
   * segmented control. A larger value splits them into separate pills.
   */
  spacing?: ToggleGroupSpacing;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToggleGroupProps>(), {
  variant: 'default',
  size: 'default',
  spacing: 0,
  orientation: 'horizontal',
});
// Clearing a single selection emits undefined.
const emits = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

provide(ToggleGroupKey, props);

const delegated = reactiveOmit(props, 'class', 'variant', 'size', 'spacing');
const forwarded = useForwardProps(delegated);

// Every item's value is a string, so Reka reports only strings.
function update(value: AcceptableValue | AcceptableValue[]) {
  emits('update:modelValue', value as string | string[] | undefined);
}
</script>

<template>
  <ToggleGroupRoot
    v-bind="forwarded"
    :style="
      spacing
        ? { gap: `var(--nx-spacing-${String(spacing).replace('.', '_')})` }
        : undefined
    "
    :class="
      cn(
        'nx:flex nx:w-fit nx:items-center nx:rounded-md nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
        spacing === 0 && 'nx:isolate',
        props.class
      )
    "
    data-slot="toggle-group"
    :data-variant="variant"
    :data-size="size"
    :data-spacing="spacing"
    :data-orientation="orientation"
    @update:model-value="update"
  >
    <slot />
  </ToggleGroupRoot>
</template>
