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

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="popover-content"
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
