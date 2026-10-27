<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

export interface PaginationLinkProps extends PrimitiveProps {
  size?: ButtonVariants['size'];
  /**
   * Marks the link as the current page and sets `aria-current="page"`.
   */
  isActive?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<PaginationLinkProps>(), {
  as: 'a',
  size: 'icon',
  isActive: undefined,
});
</script>

<template>
  <Primitive
    :aria-current="isActive ? 'page' : undefined"
    data-slot="pagination-link"
    :data-active="isActive"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        buttonVariants({ variant: isActive ? 'outline' : 'ghost', size }),
        'nx:typography-label-default',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
