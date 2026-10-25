<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  ContextMenuContent,
  type ContextMenuContentEmits,
  type ContextMenuContentProps as RekaContextMenuContentProps,
  ContextMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface ContextMenuContentProps extends RekaContextMenuContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<ContextMenuContentProps>();
const emits = defineEmits<ContextMenuContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <ContextMenuPortal>
    <ContextMenuContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="context-menu-content"
      :class="
        cn(
          'nx:z-popover nx:max-h-(--reka-context-menu-content-available-height)',
          'nx:min-w-32 nx:overflow-x-hidden nx:overflow-y-auto',
          popoverSurfaceClassName,
          'nx:p-1',
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </ContextMenuContent>
  </ContextMenuPortal>
</template>
