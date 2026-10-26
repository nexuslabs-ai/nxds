<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { type ItemVariants, itemVariants } from '.';

export interface ItemProps extends PrimitiveProps {
  variant?: ItemVariants['variant'];
  size?: ItemVariants['size'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ItemProps>(), {
  as: 'div',
  variant: 'default',
  size: 'default',
});
</script>

<template>
  <Primitive
    data-slot="item"
    :data-variant="variant"
    :data-size="size"
    :as="as"
    :as-child="asChild"
    :class="cn(itemVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
