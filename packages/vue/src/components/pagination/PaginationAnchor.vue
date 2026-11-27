<script setup lang="ts">
import { Primitive } from 'reka-ui';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

import type { PaginationLinkProps } from './PaginationLink.vue';

/** The link every pagination part renders. Page numbers are square. */
const props = defineProps<PaginationLinkProps & { square: boolean }>();
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
        buttonVariants({
          variant: isActive ? 'outline' : 'ghost',
          size,
          iconOnly: square,
        }),
        'nx:typography-label-default',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
