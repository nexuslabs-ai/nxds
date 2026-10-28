<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { messageMetaClassName } from '.';

export interface MessageFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MessageFooterProps>();
</script>

<template>
  <div
    data-slot="message-footer"
    :class="cn(messageMetaClassName, props.class)"
  >
    <slot />
  </div>
</template>
