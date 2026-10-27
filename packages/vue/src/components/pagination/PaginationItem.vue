<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

export interface PaginationItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<PaginationItemProps>();
</script>

<template>
  <li data-slot="pagination-item" :class="props.class">
    <slot />
  </li>
</template>
