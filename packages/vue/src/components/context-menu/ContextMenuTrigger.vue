<script setup lang="ts">
import {
  ContextMenuTrigger,
  type ContextMenuTriggerProps as RekaContextMenuTriggerProps,
} from 'reka-ui';

export type ContextMenuTriggerProps = RekaContextMenuTriggerProps;

const props = defineProps<ContextMenuTriggerProps>();
</script>

<template>
  <ContextMenuTrigger v-bind="props" data-slot="context-menu-trigger">
    <slot />
  </ContextMenuTrigger>
</template>
