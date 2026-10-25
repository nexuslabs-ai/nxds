<script setup lang="ts">
import { DrawerOverlay } from 'vaul-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { overlayScrimTransitionClassName } from '../overlay-layout/overlay-layout';

export interface DrawerOverlayProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DrawerOverlayProps>();
</script>

<template>
  <DrawerOverlay
    data-slot="drawer-overlay"
    :class="
      cn(
        'nx:fixed nx:inset-0 nx:z-modal nx:bg-overlay',
        overlayScrimTransitionClassName,
        props.class
      )
    "
  />
</template>
