<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayBodyClassName } from '../overlay-layout/overlay-layout';

export interface DrawerBodyProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DrawerBodyProps>();
</script>

<template>
  <div
    data-slot="drawer-body"
    tabindex="0"
    :class="cn(overlayBodyClassName, props.class)"
  >
    <slot />
  </div>
</template>
