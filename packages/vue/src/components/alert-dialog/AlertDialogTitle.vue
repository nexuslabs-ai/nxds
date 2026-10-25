<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogTitle,
  type AlertDialogTitleProps as RekaAlertDialogTitleProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertDialogTitleProps extends RekaAlertDialogTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDialogTitleProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AlertDialogTitle
    v-bind="forwarded"
    data-slot="alert-dialog-title"
    :class="cn('nx:m-0 nx:typography-heading-small', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
