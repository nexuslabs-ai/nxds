<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';
import {
  defaultOverlayLayout,
  overlayFooterVariants,
} from '../overlay-layout/overlay-layout';

import { AlertDialogLayoutKey } from '.';

export interface AlertDialogFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDialogFooterProps>();

const layout = inject(AlertDialogLayoutKey, defaultOverlayLayout);
</script>

<template>
  <div
    data-slot="alert-dialog-footer"
    :data-orientation="layout.buttonOrientation"
    :class="
      cn(
        overlayFooterVariants({ orientation: layout.buttonOrientation }),
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
