<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import TableHead from './TableHead.vue';

import { tableSelectionCellClassName } from '.';

export interface TableSelectionHeadProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableSelectionHeadProps>();
</script>

<template>
  <TableHead
    data-slot="table-selection-head"
    :class="cn(tableSelectionCellClassName, props.class)"
  >
    <slot />
  </TableHead>
</template>
