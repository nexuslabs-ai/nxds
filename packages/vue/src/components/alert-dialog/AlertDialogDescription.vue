<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogDescription,
  type AlertDialogDescriptionProps as RekaAlertDialogDescriptionProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AlertDialogDescriptionProps extends RekaAlertDialogDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDialogDescriptionProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AlertDialogDescription
    v-bind="forwarded"
    data-slot="alert-dialog-description"
    :class="
      cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </AlertDialogDescription>
</template>
