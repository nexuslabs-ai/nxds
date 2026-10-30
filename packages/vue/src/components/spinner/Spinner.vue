<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { IconLoader2 } from '../../lib/icons';
import { cn } from '../../lib/utils';

export interface SpinnerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SpinnerProps>();
</script>

<template>
  <IconLoader2
    role="status"
    aria-label="Loading"
    data-slot="spinner"
    :class="cn('nx:size-icon-glyph-default nx:animate-spin', props.class)"
  />
</template>
