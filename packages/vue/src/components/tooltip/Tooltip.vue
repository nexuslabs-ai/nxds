<script setup lang="ts">
import {
  TooltipProvider,
  TooltipRoot,
  type TooltipRootEmits,
  type TooltipRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import { inject } from 'vue';

import { TooltipGroupKey } from './tooltip-group';

export type TooltipProps = TooltipRootProps;

const props = defineProps<TooltipProps>();
const emits = defineEmits<TooltipRootEmits>();
const forwarded = useForwardPropsEmits(props, emits);

const inGroup = inject(TooltipGroupKey, false);
</script>

<template>
  <TooltipRoot v-if="inGroup" v-bind="forwarded">
    <slot />
  </TooltipRoot>
  <TooltipProvider v-else>
    <TooltipRoot v-bind="forwarded">
      <slot />
    </TooltipRoot>
  </TooltipProvider>
</template>
