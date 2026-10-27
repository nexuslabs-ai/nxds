<script setup lang="ts">
import {
  HoverCardTrigger,
  type HoverCardTriggerProps as RekaHoverCardTriggerProps,
} from 'reka-ui';

export type HoverCardTriggerProps = RekaHoverCardTriggerProps;

const props = defineProps<HoverCardTriggerProps>();
</script>

<template>
  <HoverCardTrigger v-bind="props" data-slot="hover-card-trigger">
    <slot />
  </HoverCardTrigger>
</template>
