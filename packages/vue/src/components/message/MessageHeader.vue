<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { messageMetaClassName } from '.';

export interface MessageHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageHeaderProps>();
</script>

<template>
  <div
    data-slot="message-header"
    :class="cn(messageMetaClassName, props.class)"
  >
    <slot />
  </div>
</template>
