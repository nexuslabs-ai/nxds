<script setup lang="ts">
import { IconChevronRight } from '../../lib/icons';
import type { ButtonVariants } from '../button';

import PaginationLink, { type PaginationLinkProps } from './PaginationLink.vue';

export interface PaginationNextProps extends Omit<PaginationLinkProps, 'size'> {
  size?: ButtonVariants['size'];
}

const props = withDefaults(defineProps<PaginationNextProps>(), {
  as: 'a',
  size: 'default',
  isActive: undefined,
});
</script>

<template>
  <PaginationLink aria-label="Go to next page" v-bind="props">
    <slot>
      <span>Next</span>
      <IconChevronRight />
    </slot>
  </PaginationLink>
</template>
