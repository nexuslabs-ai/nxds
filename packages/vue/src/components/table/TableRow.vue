<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { tableContextDefaults, TableKey, tableRowVariants } from '.';

export interface TableRowProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableRowProps>();

const table = inject(TableKey, tableContextDefaults);
</script>

<template>
  <tr
    data-slot="table-row"
    :class="cn(tableRowVariants({ variant: table.variant }), props.class)"
  >
    <slot />
  </tr>
</template>
