<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayBodyClassName } from '../overlay-layout/overlay-layout';

export interface SheetBodyProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SheetBodyProps>();
</script>

<template>
  <div
    data-slot="sheet-body"
    tabindex="0"
    :class="cn(overlayBodyClassName, props.class)"
  >
    <slot />
  </div>
</template>
