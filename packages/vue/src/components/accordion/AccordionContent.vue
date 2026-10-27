<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AccordionContent,
  type AccordionContentProps as RekaAccordionContentProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

export interface AccordionContentProps extends RekaAccordionContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AccordionContentProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AccordionContent
    v-bind="forwarded"
    data-slot="accordion-content"
    class="nx:overflow-hidden nx:typography-body-default nx:text-muted-foreground nx:duration-default nx:data-[state=closed]:animate-accordion-up nx:data-[state=open]:animate-accordion-down"
  >
    <div :class="props.class"><slot /></div>
  </AccordionContent>
</template>
