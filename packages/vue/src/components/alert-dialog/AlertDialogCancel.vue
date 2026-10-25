<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogCancel,
  type AlertDialogCancelProps as RekaAlertDialogCancelProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

export interface AlertDialogCancelProps extends RekaAlertDialogCancelProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AlertDialogCancelProps>(), {
  variant: 'outline',
});

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AlertDialogCancel
    v-bind="forwarded"
    data-slot="alert-dialog-cancel"
    :data-variant="variant"
    :data-size="size"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </AlertDialogCancel>
</template>
