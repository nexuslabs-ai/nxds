<script setup lang="ts">
import { IconChevronDown } from '@tabler/icons-vue';
import { reactiveOmit } from '@vueuse/core';
import {
  SelectScrollDownButton,
  type SelectScrollDownButtonProps as RekaSelectScrollDownButtonProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SelectScrollDownButtonProps extends RekaSelectScrollDownButtonProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SelectScrollDownButtonProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <SelectScrollDownButton
    v-bind="forwarded"
    data-slot="select-scroll-down-button"
    :class="
      cn(
        'nx:flex nx:cursor-default nx:items-center nx:justify-center nx:py-1',
        props.class
      )
    "
  >
    <IconChevronDown class="nx:size-icon-glyph-default" />
  </SelectScrollDownButton>
</template>
