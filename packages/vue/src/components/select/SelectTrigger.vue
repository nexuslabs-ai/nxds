<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SelectIcon,
  SelectTrigger,
  type SelectTriggerProps as RekaSelectTriggerProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconChevronDown } from '../../lib/icons';
import { cn } from '../../lib/utils';

import { type SelectTriggerVariants, selectTriggerVariants } from '.';

export interface SelectTriggerProps extends RekaSelectTriggerProps {
  size?: SelectTriggerVariants['size'];
  variant?: SelectTriggerVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = defineProps<SelectTriggerProps>();

const delegated = reactiveOmit(props, 'class', 'size', 'variant');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <SelectTrigger
    v-bind="forwarded"
    data-slot="select-trigger"
    :data-size="size ?? 'default'"
    :data-variant="variant ?? 'bordered'"
    :class="cn(selectTriggerVariants({ size, variant }), props.class)"
  >
    <slot />
    <SelectIcon as-child>
      <IconChevronDown
        class="nx:size-icon-glyph-default nx:text-muted-foreground nx:group-disabled/select-trigger:text-disabled-foreground"
      />
    </SelectIcon>
  </SelectTrigger>
</template>
