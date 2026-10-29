<script setup lang="ts">
import { IconChevronUp } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  SelectScrollUpButton,
  type SelectScrollUpButtonProps as RekaSelectScrollUpButtonProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

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
        'nx:flex nx:cursor-default nx:items-center nx:justify-center nx:py-1',
        props.class
      )
    "
  >
    <IconChevronUp class="nx:size-icon-glyph-default" />
  </SelectScrollUpButton>
</template>
