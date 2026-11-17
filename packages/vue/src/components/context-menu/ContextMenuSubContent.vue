<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ContextMenuPortal,
  ContextMenuSubContent,
  type ContextMenuSubContentEmits,
  type ContextMenuSubContentProps as RekaContextMenuSubContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  menuListClassName,
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface ContextMenuSubContentProps extends RekaContextMenuSubContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ContextMenuSubContentProps>();
const emits = defineEmits<ContextMenuSubContentEmits>();

defineOptions({ inheritAttrs: false });

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuSubContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="context-menu-sub-content"
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
    </ContextMenuSubContent>
  </ContextMenuPortal>
</template>
