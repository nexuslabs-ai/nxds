<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { tableCellVariants, tableContextDefaults, TableKey } from '.';

export interface TableRowHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableRowHeaderProps>();

const table = inject(TableKey, tableContextDefaults);
</script>

<template>
  <th
    scope="row"
    data-slot="table-row-header"
    :class="
      cn(
        tableCellVariants({ variant: table.variant, density: table.density }),
        'nx:typography-label-default',
        props.class
      )
    "
  >
    <slot />
  </th>
</template>
