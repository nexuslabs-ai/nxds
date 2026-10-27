<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import TableCell from './TableCell.vue';

import { tableSelectionCellClassName } from '.';

export interface TableSelectionCellProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableSelectionCellProps>();
</script>

<template>
  <TableCell
    data-slot="table-selection-cell"
    :class="cn(tableSelectionCellClassName, props.class)"
  >
    <slot />
  </TableCell>
</template>
