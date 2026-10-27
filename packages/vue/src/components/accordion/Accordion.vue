<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AccordionRoot,
  type AccordionRootEmits,
  type AccordionRootProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type AccordionVariants, accordionVariants } from '.';

export interface AccordionProps extends AccordionRootProps {
  variant?: AccordionVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AccordionProps>(), {
  variant: 'stacked',
});
const emits = defineEmits<AccordionRootEmits>();

const delegated = reactiveOmit(props, 'class', 'variant');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <AccordionRoot
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="accordion"
    :data-variant="variant"
    :data-orientation="orientation ?? 'vertical'"
    :class="cn(accordionVariants({ variant }), props.class)"
  >
    <slot v-bind="slotProps" />
  </AccordionRoot>
</template>
