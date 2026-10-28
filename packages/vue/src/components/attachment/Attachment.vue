<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Item } from '../item';

import {
  type AttachmentState,
  type AttachmentVariants,
  attachmentVariants,
} from '.';

export interface AttachmentProps {
  /**
   * Upload state. Screen readers announce in-progress and error states, and `idle` or `error` change the border.
   */
  state?: AttachmentState;
  /**
   * Replaces the built-in status text, such as 'Uploading'. Ignored while `idle` or `done`.
   */
  statusLabel?: string;
  orientation?: AttachmentVariants['orientation'];
  size?: AttachmentVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AttachmentProps>(), {
  state: 'done',
  orientation: 'horizontal',
  size: 'default',
});

/**
 * Announced states only — a settled card (`idle` / `done`) stays silent, so it
 * has no entry here and the live region renders empty.
 */
const ATTACHMENT_STATUS_TEXT: Partial<Record<AttachmentState, string>> = {
  uploading: 'Uploading',
  processing: 'Processing',
  error: 'Upload failed',
};

const statusText = computed(() => ATTACHMENT_STATUS_TEXT[props.state]);
</script>

<template>
  <!-- Attachment pins Item's variant and exposes none, so it drops Item's data-variant. -->
  <Item
    data-slot="attachment"
    :data-state="state"
    :data-orientation="orientation"
    :data-variant="undefined"
    variant="outline"
    :size="size"
    :class="cn(attachmentVariants({ size, orientation }), props.class)"
  >
    <!-- The region stays mounted and empty while settled: a live region inserted together with its text is not reliably announced. -->
    <span data-slot="attachment-status" role="status" class="nx:sr-only">{{
      statusText ? (statusLabel ?? statusText) : ''
    }}</span>
    <slot />
  </Item>
</template>
