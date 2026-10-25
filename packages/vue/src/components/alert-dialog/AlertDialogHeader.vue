<script setup lang="ts">
import { computed, type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import {
  defaultOverlayLayout,
  type OverlayHeaderVariants,
  overlayHeaderVariants,
} from '../overlay-layout/overlay-layout';

import { AlertDialogLayoutKey } from '.';

export interface AlertDialogHeaderProps {
  variant?: OverlayHeaderVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDialogHeaderProps>();

const layout = inject(AlertDialogLayoutKey, defaultOverlayLayout);
const resolvedVariant = computed(() => props.variant ?? layout.variant);
</script>

<template>
  <div
    data-slot="alert-dialog-header"
    :data-variant="resolvedVariant"
    :class="
      cn(overlayHeaderVariants({ variant: resolvedVariant }), props.class)
    "
  >
    <slot />
  </div>
</template>
