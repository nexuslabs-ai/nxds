<script setup lang="ts">
import type { VNode } from 'vue';

import { cn } from '../../lib/utils';
import { Button, type ButtonProps } from '../button';

import { type InputGroupButtonVariants, inputGroupButtonVariants } from '.';

export interface InputGroupButtonProps extends Omit<ButtonProps, 'size'> {
  size?: InputGroupButtonVariants['size'];
}

const props = withDefaults(defineProps<InputGroupButtonProps>(), {
  as: 'button',
  variant: 'ghost',
  size: 'xs',
  loading: false,
  type: 'button',
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();
</script>

<template>
  <Button
    :as="as"
    :as-child="asChild"
    :variant="variant"
    :loading="loading"
    :disabled="disabled"
    :type="type"
    data-slot="input-group-button"
    :data-size="size"
    :class="cn(inputGroupButtonVariants({ size }), props.class)"
  >
    <template v-if="slots['start-icon']" #start-icon>
      <slot name="start-icon" />
    </template>
    <slot />
    <template v-if="slots['end-icon']" #end-icon>
      <slot name="end-icon" />
    </template>
  </Button>
</template>
