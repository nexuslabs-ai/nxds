<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DialogOverlay,
  type DialogOverlayProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayScrimTransitionClassName } from '../overlay-layout/overlay-layout';

export interface SheetOverlayProps extends DialogOverlayProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SheetOverlayProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DialogOverlay
    v-bind="forwarded"
    data-slot="sheet-overlay"
    :class="
      cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        overlayScrimTransitionClassName,
        props.class
      )
    "
  />
</template>
