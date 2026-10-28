<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ToolbarButton,
  type ToolbarButtonProps as RekaToolbarButtonProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

export interface ToolbarButtonProps extends RekaToolbarButtonProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToolbarButtonProps>(), {
  as: 'button',
  variant: 'ghost',
  size: 'sm',
});

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
</script>

<template>
  <ToolbarButton
    v-bind="delegated"
    data-slot="toolbar-button"
    :data-variant="variant"
    :data-size="size"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </ToolbarButton>
</template>
