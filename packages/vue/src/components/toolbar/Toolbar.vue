<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { ToolbarRoot, type ToolbarRootProps, useForwardProps } from 'reka-ui';
import { type FunctionalComponent, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import { TooltipGroupKey } from '../tooltip/tooltip-group';
import TooltipProvider from '../tooltip/TooltipProvider.vue';

import { toolbarVariants } from '.';

type ToolbarVariant = 'default' | 'floating';

export interface ToolbarProps extends ToolbarRootProps {
  /** Floating lifts the toolbar above the content it sits over, like a canvas. */
  variant?: ToolbarVariant;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

// Radix wraps arrow-key focus by default; Reka doesn't.
const props = withDefaults(defineProps<ToolbarProps>(), {
  loop: true,
  variant: 'default',
});

const delegated = reactiveOmit(props, 'class', 'variant');
const forwarded = useForwardProps(delegated);

const Passthrough: FunctionalComponent = (_, { slots }) => slots.default?.();
const Group = inject(TooltipGroupKey, false) ? Passthrough : TooltipProvider;

// Reka drops the toolbar's own tab stop on Shift+Tab at the next render, so a
// focus move in the same task would land on the toolbar. Radix drops it at once.
function dropTabStop(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !event.shiftKey) return;
  (event.currentTarget as HTMLElement).tabIndex = -1;
}
</script>

<template>
  <Group>
    <ToolbarRoot
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="toolbar"
      :data-variant="variant"
      :class="cn(toolbarVariants({ variant }), props.class)"
      @keydown.capture="dropTabStop"
    >
      <slot />
    </ToolbarRoot>
  </Group>
</template>
