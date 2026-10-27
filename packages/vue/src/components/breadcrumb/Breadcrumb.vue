<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

export interface BreadcrumbProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<BreadcrumbProps>();
</script>

<template>
  <nav aria-label="breadcrumb" data-slot="breadcrumb" :class="props.class">
    <slot />
  </nav>
</template>
