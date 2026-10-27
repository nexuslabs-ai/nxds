<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { ToolbarRoot, type ToolbarRootProps, useForwardProps } from 'reka-ui';
import { type FunctionalComponent, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import { TooltipGroupKey } from '../tooltip/tooltip-group';
import TooltipProvider from '../tooltip/TooltipProvider.vue';

export interface ToolbarProps extends ToolbarRootProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

// Radix wraps arrow-key focus by default; Reka doesn't.
const props = withDefaults(defineProps<ToolbarProps>(), { loop: true });

const delegated = reactiveOmit(props, 'class');
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
      :class="
        cn(
          'nx:flex nx:w-fit nx:max-w-full nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5 nx:rounded-lg nx:border-default nx:border-border-default nx:bg-container nx:p-0.5 nx:shadow-sm nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
          props.class
        )
      "
      @keydown.capture="dropTabStop"
    >
      <slot />
    </ToolbarRoot>
  </Group>
</template>
