<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SelectContent,
  type SelectContentEmits,
  type SelectContentProps as RekaSelectContentProps,
  SelectPortal,
  SelectViewport,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  overlayFloatingTransitionClassName,
  popoverSurfaceClassName,
} from '../overlay-layout/overlay-layout';

import SelectScrollDownButton from './SelectScrollDownButton.vue';
import SelectScrollUpButton from './SelectScrollUpButton.vue';

export interface SelectContentProps extends RekaSelectContentProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SelectContentProps>(), {
  position: 'popper',
});
const emits = defineEmits<SelectContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <SelectPortal>
    <SelectContent
      v-bind="{ ...$attrs, ...forwarded }"
      data-slot="select-content"
      :class="
        cn(
          'nx:relative nx:z-popover nx:max-h-96 nx:min-w-32 nx:overflow-hidden',
          popoverSurfaceClassName,
          overlayFloatingTransitionClassName,
          position === 'popper' &&
            'nx:data-[side=bottom]:translate-y-1 nx:data-[side=left]:-translate-x-1 nx:data-[side=right]:translate-x-1 nx:data-[side=top]:-translate-y-1',
          props.class
        )
      "
    >
      <SelectScrollUpButton />
      <SelectViewport
        :class="
          cn(
            'nx:p-1',
            position === 'popper' &&
              'nx:h-(--reka-select-trigger-height) nx:w-full nx:min-w-(--reka-select-trigger-width)'
          )
        "
      >
        <slot />
      </SelectViewport>
      <SelectScrollDownButton />
    </SelectContent>
  </SelectPortal>
</template>
