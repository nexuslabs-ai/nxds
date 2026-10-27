<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

export interface TableHeaderProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<TableHeaderProps>();
</script>

<template>
  <thead data-slot="table-header" :class="props.class">
    <slot />
  </thead>
</template>
