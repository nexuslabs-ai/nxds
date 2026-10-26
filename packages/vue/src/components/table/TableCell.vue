<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { tableCellVariants, tableContextDefaults, TableKey } from '.';

export interface TableCellProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableCellProps>();

const table = inject(TableKey, tableContextDefaults);
</script>

<template>
  <td
    data-slot="table-cell"
    :class="
      cn(
        tableCellVariants({ variant: table.variant, density: table.density }),
        props.class
      )
    "
  >
    <slot />
  </td>
</template>
