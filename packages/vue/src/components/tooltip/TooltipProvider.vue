<script setup lang="ts">
import {
  TooltipProvider,
  type TooltipProviderProps as RekaTooltipProviderProps,
  useForwardProps,
} from 'reka-ui';
import { provide } from 'vue';

import { TooltipGroupKey } from './tooltip-group';

export type TooltipProviderProps = RekaTooltipProviderProps;

const props = defineProps<TooltipProviderProps>();
const forwarded = useForwardProps(props);

provide(TooltipGroupKey, true);
</script>

<template>
  <TooltipProvider v-bind="forwarded">
    <slot />
  </TooltipProvider>
</template>
