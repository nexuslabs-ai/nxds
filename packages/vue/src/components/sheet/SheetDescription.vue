<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  DialogDescription,
  type DialogDescriptionProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SheetDescriptionProps extends DialogDescriptionProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<SheetDescriptionProps>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <DialogDescription
    v-bind="forwarded"
    data-slot="sheet-description"
    :class="
      cn(
        'nx:m-0 nx:typography-body-default nx:text-muted-foreground',
        props.class
      )
    "
  >
    <slot />
  </DialogDescription>
</template>
