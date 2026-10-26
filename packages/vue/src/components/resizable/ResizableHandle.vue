<script setup lang="ts">
import { IconGripVertical } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  injectSplitterGroupContext,
  SplitterResizeHandle,
  type SplitterResizeHandleEmits,
  type SplitterResizeHandleProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ResizableHandleProps extends SplitterResizeHandleProps {
  /**
   * Shows a grip in the centre of the handle.
   */
  withHandle?: boolean;
  class?: HTMLAttributes['class'];
}

const props = defineProps<ResizableHandleProps>();
const emits = defineEmits<SplitterResizeHandleEmits>();

const delegated = reactiveOmit(props, 'class', 'withHandle');
const forwarded = useForwardPropsEmits(delegated, emits);

// The divider runs across the split, as react-resizable-panels marks it; Reka
// sets no aria-orientation.
const group = injectSplitterGroupContext();
</script>

<template>
  <SplitterResizeHandle
    v-bind="forwarded"
    data-slot="resizable-handle"
    :aria-orientation="
      group.direction.value === 'horizontal' ? 'vertical' : 'horizontal'
    "
    :class="
      cn(
        'nx:relative nx:flex nx:w-px nx:items-center nx:justify-center nx:bg-border-default',
        'nx:after:absolute nx:after:inset-y-0 nx:after:left-1/2 nx:after:w-1 nx:after:-translate-x-1/2',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:aria-[orientation=horizontal]:h-px nx:aria-[orientation=horizontal]:w-full nx:aria-[orientation=horizontal]:after:left-0 nx:aria-[orientation=horizontal]:after:h-1 nx:aria-[orientation=horizontal]:after:w-full nx:aria-[orientation=horizontal]:after:translate-x-0 nx:aria-[orientation=horizontal]:after:-translate-y-1/2',
        'nx:aria-[orientation=horizontal]:[&>div]:rotate-90',
        props.class
      )
    "
  >
    <div
      v-if="withHandle"
      class="nx:z-10 nx:flex nx:h-4 nx:w-3 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:border-border-default nx:bg-border-default"
    >
      <IconGripVertical class="nx:size-2.5" />
    </div>
  </SplitterResizeHandle>
</template>
