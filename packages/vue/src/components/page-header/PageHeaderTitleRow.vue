<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderTitleRowProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PageHeaderTitleRowProps>();
</script>

<template>
  <div
    data-slot="page-header-title-row"
    :class="cn('nx:flex nx:flex-wrap nx:items-center nx:gap-2', props.class)"
  >
    <slot />
  </div>
</template>
