<script setup lang="ts">
import { type HTMLAttributes, inject } from 'vue';

import { cn } from '../../lib/utils';

import { tableContextDefaults, tableFooterVariants, TableKey } from '.';

export interface TableFooterProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableFooterProps>();

const table = inject(TableKey, tableContextDefaults);
</script>

<template>
  <tfoot
    data-slot="table-footer"
    :class="cn(tableFooterVariants({ variant: table.variant }), props.class)"
  >
    <slot />
  </tfoot>
</template>
