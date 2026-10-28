<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { ItemDescription } from '../item';

export interface AttachmentDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AttachmentDescriptionProps>();
</script>

<template>
  <ItemDescription
    data-slot="attachment-description"
    :class="
      cn(
        'nx:group-data-[state=error]/attachment:text-error-subtle-foreground',
        props.class
      )
    "
  >
    <slot />
  </ItemDescription>
</template>
