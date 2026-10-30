<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  SelectScrollUpButton,
  type SelectScrollUpButtonProps as RekaSelectScrollUpButtonProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { IconChevronUp } from '../../lib/icons';
import { cn } from '../../lib/utils';

export interface SelectScrollUpButtonProps extends RekaSelectScrollUpButtonProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SelectScrollUpButtonProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <SelectScrollUpButton
    v-bind="forwarded"
    data-slot="select-scroll-up-button"
    :class="
      cn(
        'nx:flex nx:cursor-default nx:items-center nx:justify-center nx:py-1 nx:icon-stroke',
        props.class
      )
    "
  >
    <IconChevronUp class="nx:size-icon-glyph-default" />
  </SelectScrollUpButton>
</template>
