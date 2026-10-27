<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogAction,
  type AlertDialogActionProps as RekaAlertDialogActionProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

export interface AlertDialogActionProps extends RekaAlertDialogActionProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AlertDialogActionProps>(), {
  variant: 'default',
});

const delegated = reactiveOmit(props, 'class', 'variant', 'size');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AlertDialogAction
    v-bind="forwarded"
    data-slot="alert-dialog-action"
    :data-variant="variant"
    :data-size="size"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>
