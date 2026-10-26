<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type MarkerVariants, markerVariants } from '.';

export interface MarkerProps extends PrimitiveProps {
  variant?: MarkerVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MarkerProps>(), {
  as: 'div',
  variant: 'default',
});
</script>

<template>
  <Primitive
    data-slot="marker"
    :data-variant="variant"
    :as="as"
    :as-child="asChild"
    :class="cn(markerVariants({ variant }), props.class)"
  >
    <slot />
  </Primitive>
</template>
