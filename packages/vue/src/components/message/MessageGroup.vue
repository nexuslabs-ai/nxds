<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MessageGroupProps {
  /**
   * Announces new turns in a live chat. Leave it off for static, paged or
   * virtualised transcripts, and set `aria-busy` on a turn while its reply
   * streams.
   */
  announce?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MessageGroupProps>(), {
  announce: false,
});
</script>

<template>
  <div
    data-slot="message-group"
    :role="announce ? 'log' : undefined"
    :class="
      cn('nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:gap-4', props.class)
    "
  >
    <slot />
  </div>
</template>
