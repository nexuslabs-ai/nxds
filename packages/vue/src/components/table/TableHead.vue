<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { tableContextDefaults, tableHeadVariants, TableKey } from '.';

export interface TableHeadProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableHeadProps>();

const table = inject(TableKey, tableContextDefaults);
</script>

<template>
  <th
    scope="col"
    data-slot="table-head"
    :class="
      cn(
        tableHeadVariants({ variant: table.variant, density: table.density }),
        table.stickyHeader && 'nx:sticky nx:top-0 nx:z-sticky nx:bg-container',
        props.class
      )
    "
  >
    <slot />
  </th>
</template>
