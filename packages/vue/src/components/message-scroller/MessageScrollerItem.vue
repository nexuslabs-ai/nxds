<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface MessageScrollerItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageScrollerItemProps>();
</script>

<template>
  <div
    data-slot="message-scroller-item"
    :class="cn('nx:min-w-0 nx:shrink-0', props.class)"
  >
    <slot />
  </div>
</template>
