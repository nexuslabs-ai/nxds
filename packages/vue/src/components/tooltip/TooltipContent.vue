<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  TooltipContent,
  type TooltipContentEmits,
  type TooltipContentProps as RekaTooltipContentProps,
  TooltipPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  tooltipSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface TooltipContentProps extends RekaTooltipContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<TooltipContentProps>(), {
  sideOffset: 4,
});
const emits = defineEmits<TooltipContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <TooltipPortal>
    <TooltipContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="tooltip-content"
      :class="
        cn(
          'nx:z-popover nx:overflow-hidden',
          tooltipSurfaceClassName,
          'nx:px-3 nx:py-1.5',
          'nx:typography-body-small',
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </TooltipContent>
  </TooltipPortal>
</template>
