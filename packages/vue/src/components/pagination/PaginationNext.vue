<script setup lang="ts">
import { IconChevronRight } from '@tabler/icons-vue';

import type { ButtonVariants } from '../button';

import PaginationAnchor from './PaginationAnchor.vue';
import type { PaginationLinkProps } from './PaginationLink.vue';

export interface PaginationNextProps extends Omit<PaginationLinkProps, 'size'> {
  size?: ButtonVariants['size'];
}

const props = withDefaults(defineProps<PaginationNextProps>(), {
  as: 'a',
  isActive: undefined,
});
</script>

<template>
  <PaginationAnchor :square="false" aria-label="Go to next page" v-bind="props">
    <slot>
      <span>Next</span>
      <IconChevronRight />
    </slot>
  </PaginationAnchor>
</template>
