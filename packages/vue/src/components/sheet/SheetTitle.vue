<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { DialogTitle, type DialogTitleProps, useForwardProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SheetTitleProps extends DialogTitleProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SheetTitleProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DialogTitle
    v-bind="forwarded"
    data-slot="sheet-title"
    :class="
      cn('nx:m-0 nx:typography-heading-xsmall nx:text-balance', props.class)
    "
  >
    <slot />
  </DialogTitle>
</template>
