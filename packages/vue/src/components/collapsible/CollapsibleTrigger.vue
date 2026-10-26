<script setup lang="ts">
import {
  CollapsibleTrigger,
  type CollapsibleTriggerProps as RekaCollapsibleTriggerProps,
} from 'reka-ui';

export type CollapsibleTriggerProps = RekaCollapsibleTriggerProps;

const props = defineProps<RekaCollapsibleTriggerProps>();
</script>

<template>
  <CollapsibleTrigger v-bind="props" data-slot="collapsible-trigger">
    <slot />
  </CollapsibleTrigger>
</template>
