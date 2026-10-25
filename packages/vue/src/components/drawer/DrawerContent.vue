<script setup lang="ts">
import { DrawerContent, DrawerPortal } from 'vaul-vue';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import DrawerOverlay from './DrawerOverlay.vue';

export interface DrawerContentProps {
  /**
   * Shows the handle on bottom drawers. Hiding it does not change dragging or
   * dismissal.
   */
  showHandle?: boolean;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DrawerContentProps>(), {
  showHandle: true,
});
</script>

<template>
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerContent
      v-bind="$attrs"
      data-slot="drawer-content"
      :class="
        cn(
          'nx:group/drawer-content nx:fixed nx:z-modal nx:flex nx:h-auto nx:flex-col nx:overflow-hidden nx:bg-container nx:shadow-lg',
          'nx:data-[vaul-drawer-direction=top]:inset-x-0 nx:data-[vaul-drawer-direction=top]:top-0 nx:data-[vaul-drawer-direction=top]:mb-24 nx:data-[vaul-drawer-direction=top]:max-h-[80svh] nx:data-[vaul-drawer-direction=top]:rounded-b-lg nx:data-[vaul-drawer-direction=top]:border-b-default nx:data-[vaul-drawer-direction=top]:border-border-default',
          'nx:data-[vaul-drawer-direction=bottom]:inset-x-0 nx:data-[vaul-drawer-direction=bottom]:bottom-0 nx:data-[vaul-drawer-direction=bottom]:mt-24 nx:data-[vaul-drawer-direction=bottom]:max-h-[80svh] nx:data-[vaul-drawer-direction=bottom]:rounded-t-lg nx:data-[vaul-drawer-direction=bottom]:border-t-default nx:data-[vaul-drawer-direction=bottom]:border-border-default',
          'nx:data-[vaul-drawer-direction=right]:right-0 nx:data-[vaul-drawer-direction=right]:top-0 nx:data-[vaul-drawer-direction=right]:h-svh nx:data-[vaul-drawer-direction=right]:w-3/4 nx:data-[vaul-drawer-direction=right]:border-l-default nx:data-[vaul-drawer-direction=right]:border-border-default nx:data-[vaul-drawer-direction=right]:sm:max-w-sm',
          'nx:data-[vaul-drawer-direction=left]:left-0 nx:data-[vaul-drawer-direction=left]:top-0 nx:data-[vaul-drawer-direction=left]:h-svh nx:data-[vaul-drawer-direction=left]:w-3/4 nx:data-[vaul-drawer-direction=left]:border-r-default nx:data-[vaul-drawer-direction=left]:border-border-default nx:data-[vaul-drawer-direction=left]:sm:max-w-sm',
          props.class
        )
      "
    >
      <div
        v-if="showHandle"
        data-slot="drawer-handle"
        class="nx:mx-auto nx:mt-4 nx:hidden nx:h-2 nx:w-[100px] nx:shrink-0 nx:rounded-full nx:bg-muted nx:group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
      />
      <slot />
    </DrawerContent>
  </DrawerPortal>
</template>
