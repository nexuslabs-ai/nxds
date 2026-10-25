<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuContent,
  type DropdownMenuContentEmits,
  type DropdownMenuContentProps as RekaDropdownMenuContentProps,
  DropdownMenuPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface DropdownMenuContentProps extends RekaDropdownMenuContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
  sideOffset: 4,
});
const emits = defineEmits<DropdownMenuContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dropdown-menu-content"
      :class="
        cn(
          'nx:z-popover nx:max-h-(--reka-dropdown-menu-content-available-height)',
          'nx:min-w-32 nx:overflow-x-hidden nx:overflow-y-auto',
          popoverSurfaceClassName,
          'nx:p-1',
          overlayFloatingTransitionClassName,
          props.class
        )
      "
    >
      <slot />
    </DropdownMenuContent>
  </DropdownMenuPortal>
</template>
