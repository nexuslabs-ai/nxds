<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarContent,
  type MenubarContentEmits,
  type MenubarContentProps as RekaMenubarContentProps,
  MenubarPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface MenubarContentProps extends RekaMenubarContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<MenubarContentProps>(), {
  align: 'start',
  alignOffset: -4,
  sideOffset: 8,
});
const emits = defineEmits<MenubarContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarPortal>
    <MenubarContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="menubar-content"
      :class="
        cn(
          'nx:z-popover nx:min-w-48 nx:overflow-hidden',
          popoverSurfaceClassName,
          'nx:p-1',
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </MenubarContent>
  </MenubarPortal>
</template>
