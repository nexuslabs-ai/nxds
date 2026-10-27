<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { ItemContent } from '../item';

export interface AttachmentContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AttachmentContentProps>();
</script>

<template>
  <ItemContent data-slot="attachment-content" :class="props.class">
    <slot />
  </ItemContent>
</template>
