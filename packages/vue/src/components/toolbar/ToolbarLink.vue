<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ToolbarLink,
  type ToolbarLinkProps as RekaToolbarLinkProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

export interface ToolbarLinkProps extends RekaToolbarLinkProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToolbarLinkProps>(), {
  as: 'a',
  variant: 'ghost',
  size: 'sm',
});

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
</script>

<template>
  <ToolbarLink
    v-bind="delegated"
    data-slot="toolbar-link"
    :data-variant="variant"
    :data-size="size"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </ToolbarLink>
</template>
