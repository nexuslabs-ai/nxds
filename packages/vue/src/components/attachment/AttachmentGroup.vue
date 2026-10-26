<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AttachmentGroupProps {
  ariaLabel?: string;
  ariaLabelledby?: string;
  class?: HTMLAttributes['class'];
}

const props = defineProps<AttachmentGroupProps>();
</script>

<template>
  <!-- A scrollable region with no focusable children must itself be keyboard-focusable to scroll (WCAG 2.1.1). -->
  <div
    data-slot="attachment-group"
    role="group"
    tabindex="0"
    :aria-label="ariaLabel"
    :aria-labelledby="ariaLabelledby"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:snap-x nx:gap-3 nx:overflow-x-auto nx:overscroll-x-contain nx:py-1',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        'nx:*:data-[slot=attachment]:flex-none nx:*:data-[slot=attachment]:snap-start',
        props.class
      )
    "
  >
    <slot />
  </div>
</template>
