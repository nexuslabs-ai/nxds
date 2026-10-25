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

export interface ToggleGroupProps extends ToggleGroupRootProps<
  string | string[]
> {
  variant?: ToggleVariants['variant'];
  size?: ToggleVariants['size'];
  /**
   * Gap between items, in spacing-scale units. `0` joins them into one
   * segmented control. A larger value splits them into separate pills.
   */
  spacing?: number;
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
    :style="spacing ? { gap: `var(--nx-spacing-${spacing})` } : undefined"
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
