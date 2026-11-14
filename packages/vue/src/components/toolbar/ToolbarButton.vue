<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ToolbarButton,
  type ToolbarButtonProps as RekaToolbarButtonProps,
} from 'reka-ui';
import { computed, type HTMLAttributes, type VNode } from 'vue';

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

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
}>();

// `iconOnly` keeps the native button, as Button does.
const rendersAsChild = computed(() => props.asChild && !props.iconOnly);

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
    :as-child="rendersAsChild"
  >
    <slot v-if="rendersAsChild" />
    <template v-else>
      <span
        v-if="slots['start-icon']"
        aria-hidden="true"
        class="nx:inline-flex nx:shrink-0"
      >
        <slot name="start-icon" />
      </span>
      <span v-if="iconOnly" class="nx:sr-only"><slot /></span>
      <slot v-else />
    </template>
  </ToolbarButton>
</template>
