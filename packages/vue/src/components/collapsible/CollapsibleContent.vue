<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  CollapsibleContent,
  type CollapsibleContentEmits,
  type CollapsibleContentProps as RekaCollapsibleContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface CollapsibleContentProps extends RekaCollapsibleContentProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CollapsibleContentProps>();
const emits = defineEmits<CollapsibleContentEmits>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegated, emits);
</script>

<template>
  <CollapsibleContent
    v-bind="forwarded"
    data-slot="collapsible-content"
    :class="
      cn(
        'nx:overflow-hidden nx:duration-default nx:data-[state=closed]:animate-collapsible-up nx:data-[state=open]:animate-collapsible-down',
        props.class
      )
    "
  >
    <slot />
  </CollapsibleContent>
</template>
