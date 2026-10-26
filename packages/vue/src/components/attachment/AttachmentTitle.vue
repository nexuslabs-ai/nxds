<script setup lang="ts">
import type { HTMLAttributes, VNode } from 'vue';

import { cn } from '../../lib/utils';
import { ItemTitle } from '../item';

export interface AttachmentTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AttachmentTitleProps>();

const slots = defineSlots<{
  default?: () => VNode[];
  /** Badge or status icon after the file name. Keeps its width while the name truncates. */
  trailing?: () => VNode[];
}>();
</script>

<template>
  <ItemTitle
    data-slot="attachment-title"
    :class="cn('nx:w-full nx:min-w-0', props.class)"
  >
    <span class="nx:min-w-0 nx:truncate"><slot /></span>
    <span v-if="slots.trailing" class="nx:shrink-0"
      ><slot name="trailing"
    /></span>
  </ItemTitle>
</template>
