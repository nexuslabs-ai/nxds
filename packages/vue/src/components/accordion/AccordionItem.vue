<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AccordionItem,
  type AccordionItemProps as RekaAccordionItemProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AccordionItemProps extends RekaAccordionItemProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AccordionItemProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <AccordionItem
    v-slot="slotProps"
    v-bind="forwarded"
    data-slot="accordion-item"
    :class="
      cn(
        'nx:border-color-default nx:bg-container nx:px-4 nx:transition-colors nx:duration-fast nx:hover:bg-container-hover nx:data-disabled:border-color-disabled nx:data-disabled:text-disabled-foreground nx:data-disabled:hover:bg-container nx:data-[state=open]:pb-4',
        'nx:group-data-[variant=stacked]/accordion:border-b-default nx:group-data-[variant=stacked]/accordion:last:border-b-0',
        'nx:group-data-[variant=floating]/accordion:rounded-md nx:group-data-[variant=floating]/accordion:border-width-default',
        props.class
      )
    "
  >
    <slot v-bind="slotProps" />
  </AccordionItem>
</template>
