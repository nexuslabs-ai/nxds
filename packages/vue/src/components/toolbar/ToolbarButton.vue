<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ToolbarButton,
  type ToolbarButtonProps as RekaToolbarButtonProps,
} from 'reka-ui';
import type { HTMLAttributes, VNode } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

export interface ToolbarButtonProps extends RekaToolbarButtonProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  /**
   * Shows only `startIcon` in a square button. The text stays as the name
   * screen readers read, visually hidden.
   */
  iconOnly?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToolbarButtonProps>(), {
  as: 'button',
  variant: 'ghost',
  size: 'sm',
  iconOnly: false,
});

defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
}>();

const delegated = reactiveOmit(props, 'class', 'variant', 'size', 'iconOnly');
</script>

<template>
  <ToolbarButton
    v-bind="delegated"
    data-slot="toolbar-button"
    :data-variant="variant"
    :data-size="size"
    :data-icon-only="iconOnly || undefined"
    :class="cn(buttonVariants({ variant, size, iconOnly }), props.class)"
  >
    <template v-if="iconOnly">
      <span aria-hidden="true" class="nx:inline-flex nx:shrink-0">
        <slot name="start-icon" />
      </span>
      <span class="nx:sr-only"><slot /></span>
    </template>
    <slot v-else />
  </ToolbarButton>
</template>
