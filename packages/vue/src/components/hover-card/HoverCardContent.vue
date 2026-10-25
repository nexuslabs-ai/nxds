<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  type FocusOutsideEvent,
  HoverCardContent,
  type HoverCardContentProps as RekaHoverCardContentProps,
  HoverCardPortal,
  type PointerDownOutsideEvent,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface HoverCardContentProps extends RekaHoverCardContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<HoverCardContentProps>(), {
  align: 'center',
  sideOffset: 4,
});

// Reka emits these from HoverCardContent but exports no type for them.
const emits = defineEmits<{
  escapeKeyDown: [event: KeyboardEvent];
  pointerDownOutside: [event: PointerDownOutsideEvent];
  focusOutside: [event: FocusOutsideEvent];
  interactOutside: [event: PointerDownOutsideEvent | FocusOutsideEvent];
}>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <HoverCardPortal>
    <HoverCardContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="hover-card-content"
      :class="
        cn(
          'nx:z-popover nx:w-64 nx:p-container nx:outline-none',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </HoverCardContent>
  </HoverCardPortal>
</template>
