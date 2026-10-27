<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MessageProps {
  /**
   * Side of the conversation the turn sits on, mirrored under `dir="rtl"`.
   * `MessageContent` aligns its children to match, so a `Bubble` needs no
   * `align`.
   */
  align?: 'start' | 'end';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MessageProps>(), {
  align: 'start',
});
</script>

<template>
  <div
    data-slot="message"
    :data-align="align"
    :class="
      cn(
        'nx:group/message nx:flex nx:w-full nx:min-w-0 nx:gap-3 nx:data-[align=end]:flex-row-reverse',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
