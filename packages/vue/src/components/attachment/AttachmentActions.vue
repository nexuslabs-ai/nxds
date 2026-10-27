<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { ItemActions } from '../item';

export interface AttachmentActionsProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AttachmentActionsProps>();
</script>

<template>
  <ItemActions
    data-slot="attachment-actions"
    :class="cn('nx:relative nx:z-20', props.class)"
  >
    <slot />
  </ItemActions>
</template>
