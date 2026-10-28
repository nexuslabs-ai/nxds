<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MessageContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageContentProps>();
</script>

<template>
  <div
    data-slot="message-content"
    :class="
      cn(
        'nx:flex nx:w-full nx:min-w-0 nx:flex-col nx:gap-1.5 nx:wrap-break-word nx:group-data-[align=end]/message:items-end',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
