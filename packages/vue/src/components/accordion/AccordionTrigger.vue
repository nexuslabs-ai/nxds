<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  AccordionHeader,
  AccordionTrigger,
  type AccordionTriggerProps as RekaAccordionTriggerProps,
  injectAccordionItemContext,
  injectAccordionRootContext,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

defineOptions({ inheritAttrs: false });

export interface AccordionTriggerProps extends RekaAccordionTriggerProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<AccordionTriggerProps>();

const delegated = reactiveOmit(props, 'class');

const root = injectAccordionRootContext();
const item = injectAccordionItemContext();
// An open item that a click can't close reads as disabled, as Radix marks it.
const locked = computed(
  () => item.open.value && root.isSingle.value && !root.collapsible
);
</script>

<template>
  <AccordionHeader class="nx:m-0 nx:flex">
    <AccordionTrigger
      v-bind="{ ...delegated, ...$attrs }"
      data-slot="accordion-trigger"
      :aria-disabled="locked || undefined"
      :class="
        cn(
          'nx:flex nx:w-full nx:flex-1 nx:items-start nx:gap-4 nx:border-0 nx:bg-transparent nx:px-0 nx:py-4 nx:typography-label-default nx:text-foreground nx:transition-control nx:duration-fast nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:disabled:[&>svg]:text-disabled-foreground nx:[&[data-state=open]>svg]:rotate-180 nx:icon-stroke',
          props.class
        )
      "
    >
      <span
        data-slot="accordion-trigger-label"
        class="nx:min-w-0 nx:flex-1 nx:truncate nx:text-left"
      >
        <slot />
      </span>
      <IconChevronDown
        class="nx:size-icon-glyph-default nx:shrink-0 nx:text-muted-foreground nx:transition-transform nx:duration-default"
        aria-hidden="true"
      />
    </AccordionTrigger>
  </AccordionHeader>
</template>
