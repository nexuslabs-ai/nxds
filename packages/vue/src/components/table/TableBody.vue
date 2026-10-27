<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface TableBodyProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableBodyProps>();
</script>

<template>
  <tbody
    data-slot="table-body"
    :class="cn('nx:[&_tr:last-child]:border-0', props.class)"
  >
    <slot />
  </tbody>
</template>
