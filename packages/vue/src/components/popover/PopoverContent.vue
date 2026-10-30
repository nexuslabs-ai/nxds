<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  PopoverContent,
  type PopoverContentEmits,
  type PopoverContentProps as RekaPopoverContentProps,
  PopoverPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface PopoverContentProps extends RekaPopoverContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<PopoverContentProps>(), {
  align: 'center',
  sideOffset: 4,
});
const emits = defineEmits<PopoverContentEmits>();

// Reka's content emits closeAutoFocus, interactOutside and pointerDownOutside
// twice with the same event. Pass each one on once, as Radix does.
const emitted = new WeakMap<Event, Set<string>>();

function emitOnce(name: keyof PopoverContentEmits, event: Event) {
  const names = emitted.get(event) ?? new Set<string>();
  if (names.has(name)) return;
  emitted.set(event, names.add(name));
  (emits as (name: string, event: Event) => void)(name, event);
}

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emitOnce);
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="{ 'data-slot': 'popover-content', ...$attrs, ...forwarded }"
      :class="
        cn(
          'nx:z-popover nx:w-72 nx:p-container nx:outline-none',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
