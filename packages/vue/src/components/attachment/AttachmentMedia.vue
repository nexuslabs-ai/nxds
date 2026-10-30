<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { ItemMedia, type ItemMediaVariants } from '../item';

export interface AttachmentMediaProps {
  variant?: ItemMediaVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AttachmentMediaProps>(), {
  variant: 'default',
});
</script>

<template>
  <!-- translate-y-0 cancels ItemMedia's row nudge, which is meant for a media atom beside a description, not a full-width thumbnail. -->
  <ItemMedia
    data-slot="attachment-media"
    :variant="variant"
    :class="
      cn(
        'nx:group-data-[orientation=vertical]/attachment:size-auto nx:group-data-[orientation=vertical]/attachment:aspect-square nx:group-data-[orientation=vertical]/attachment:w-full nx:group-data-[orientation=vertical]/attachment:translate-y-0 nx:group-data-[orientation=vertical]/attachment:self-auto',
        'nx:group-data-[orientation=vertical]/attachment:[&_svg]:size-[calc(var(--nx-icon-glyph-default)*2)] nx:icon-stroke',
        'nx:group-data-[state=error]/attachment:border-error-border nx:group-data-[state=error]/attachment:bg-error-subtle nx:group-data-[state=error]/attachment:text-error-subtle-foreground',
        props.class
      )
    "
  >
    <slot />
  </ItemMedia>
</template>
