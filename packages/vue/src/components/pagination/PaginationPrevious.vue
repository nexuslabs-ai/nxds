<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';

import { IconChevronLeft } from '../../lib/icons';
import type { ButtonVariants } from '../button';

import PaginationAnchor from './PaginationAnchor.vue';
import type { PaginationLinkProps } from './PaginationLink.vue';

export interface PaginationPreviousProps extends Omit<
  PaginationLinkProps,
  'size'
> {
  size?: ButtonVariants['size'];
  /**
   * Shows only the chevron, in a square. The label stays as hidden text.
   */
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<PaginationPreviousProps>(), {
  as: 'a',
  isActive: undefined,
  iconOnly: false,
});

const delegated = reactiveOmit(props, 'iconOnly', 'asChild');
</script>

<template>
  <PaginationAnchor
    :square="iconOnly"
    aria-label="Go to previous page"
    v-bind="delegated"
    :as-child="asChild && !iconOnly"
  >
    <template v-if="iconOnly">
      <IconChevronLeft />
      <span class="nx:sr-only">Previous</span>
    </template>
    <slot v-else>
      <IconChevronLeft />
      <span>Previous</span>
    </slot>
  </PaginationAnchor>
</template>
