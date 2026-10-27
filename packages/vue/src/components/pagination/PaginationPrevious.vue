<script setup lang="ts">
import { IconChevronLeft } from '../../lib/icons';
import type { ButtonVariants } from '../button';

import PaginationLink, { type PaginationLinkProps } from './PaginationLink.vue';

export interface PaginationPreviousProps extends Omit<
  PaginationLinkProps,
  'size'
> {
  size?: ButtonVariants['size'];
}

const props = withDefaults(defineProps<PaginationPreviousProps>(), {
  as: 'a',
  size: 'default',
  isActive: undefined,
});
</script>

<template>
  <PaginationLink aria-label="Go to previous page" v-bind="props">
    <slot>
      <IconChevronLeft />
      <span>Previous</span>
    </slot>
  </PaginationLink>
</template>
