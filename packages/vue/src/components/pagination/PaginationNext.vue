<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';

import { IconChevronRight } from '../../lib/icons';
import type { ButtonVariants } from '../button';

import PaginationAnchor from './PaginationAnchor.vue';
import type { PaginationLinkProps } from './PaginationLink.vue';

export interface PaginationNextProps extends Omit<PaginationLinkProps, 'size'> {
  size?: ButtonVariants['size'];
  /**
   * Shows only the chevron, in a square. The label stays as hidden text.
   */
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<PaginationNextProps>(), {
  as: 'a',
  isActive: undefined,
  iconOnly: false,
});

const delegated = reactiveOmit(props, 'iconOnly');
</script>

<template>
  <PaginationAnchor
    :square="iconOnly"
    aria-label="Go to next page"
    v-bind="delegated"
  >
    <slot>
      <span :class="iconOnly ? 'nx:sr-only' : undefined">Next</span>
      <IconChevronRight />
    </slot>
  </PaginationAnchor>
</template>
