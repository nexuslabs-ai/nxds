<script setup lang="ts">
import { IconChevronLeft } from '@tabler/icons-vue';

import type { ButtonVariants } from '../button';

import PaginationAnchor from './PaginationAnchor.vue';
import type { PaginationLinkProps } from './PaginationLink.vue';

export interface PaginationPreviousProps extends Omit<
  PaginationLinkProps,
  'size'
> {
  size?: ButtonVariants['size'];
}

const props = withDefaults(defineProps<PaginationPreviousProps>(), {
  as: 'a',
  isActive: undefined,
});
</script>

<template>
  <PaginationAnchor
    :square="false"
    aria-label="Go to previous page"
    v-bind="props"
  >
    <slot>
      <IconChevronLeft />
      <span>Previous</span>
    </slot>
  </PaginationAnchor>
</template>
