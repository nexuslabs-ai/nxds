<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayBodyClassName } from '../overlay-layout/overlay-layout';

export interface AlertDialogBodyProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AlertDialogBodyProps>();
</script>

<template>
  <div
    data-slot="alert-dialog-body"
    tabindex="0"
    :class="cn(overlayBodyClassName, props.class)"
  >
    <slot />
  </div>
</template>
