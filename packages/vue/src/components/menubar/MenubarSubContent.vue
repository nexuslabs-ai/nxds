<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  MenubarPortal,
  MenubarSubContent,
  type MenubarSubContentEmits,
  type MenubarSubContentProps as RekaMenubarSubContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  menuListClassName,
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface MenubarSubContentProps extends RekaMenubarSubContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MenubarSubContentProps>();
const emits = defineEmits<MenubarSubContentEmits>();

defineOptions({ inheritAttrs: false });

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <MenubarPortal>
    <MenubarSubContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="menubar-sub-content"
      :class="
        cn(
          'nx:z-popover nx:min-w-32 nx:overflow-hidden',
          popoverSurfaceClassName,
          menuListClassName,
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </MenubarSubContent>
  </MenubarPortal>
</template>
