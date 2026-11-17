<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DropdownMenuPortal,
  DropdownMenuSubContent,
  type DropdownMenuSubContentEmits,
  type DropdownMenuSubContentProps as RekaDropdownMenuSubContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  menuListClassName,
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

export interface DropdownMenuSubContentProps extends RekaDropdownMenuSubContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<DropdownMenuSubContentProps>();
const emits = defineEmits<DropdownMenuSubContentEmits>();

defineOptions({ inheritAttrs: false });

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuSubContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="dropdown-menu-sub-content"
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
    </DropdownMenuSubContent>
  </DropdownMenuPortal>
</template>
