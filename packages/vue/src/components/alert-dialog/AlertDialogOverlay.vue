<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogOverlay,
  type AlertDialogOverlayProps as RekaAlertDialogOverlayProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayScrimVariants } from '../overlay-layout/overlay-layout';

export interface AlertDialogOverlayProps extends RekaAlertDialogOverlayProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDialogOverlayProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AlertDialogOverlay
    v-bind="forwarded"
    data-slot="alert-dialog-overlay"
    :class="cn(overlayScrimVariants(), props.class)"
  />
</template>
