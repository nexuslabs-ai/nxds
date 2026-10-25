<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  DialogClose,
  DialogContent,
  type DialogContentEmits,
  type DialogContentProps,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayCloseButtonClassName } from '../overlay-layout/overlay-layout';

import SheetOverlay from './SheetOverlay.vue';

import { type SheetContentVariants, sheetContentVariants } from '.';

export interface SheetContentProps extends DialogContentProps {
  side?: SheetContentVariants['side'];
  /**
   * Shows the close button in the top-right corner.
   */
  showCloseButton?: boolean;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SheetContentProps>(), {
  side: 'right',
  showCloseButton: true,
});
const emits = defineEmits<DialogContentEmits>();

const delegated = reactiveOmit(props, 'class', 'side', 'showCloseButton');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DialogPortal>
    <SheetOverlay />
    <DialogContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="sheet-content"
      :data-side="side"
      :class="cn(sheetContentVariants({ side }), props.class)"
    >
      <slot />
      <DialogClose
        v-if="showCloseButton"
        data-slot="sheet-close-button"
        :class="overlayCloseButtonClassName"
      >
        <IconX class="nx:size-4" />
        <span class="nx:sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
