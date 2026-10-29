<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import type { ButtonVariants } from '../button';

import PaginationAnchor from './PaginationAnchor.vue';

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
  isActive: undefined,
});
</script>

<template>
  <PaginationAnchor square v-bind="props"><slot /></PaginationAnchor>
</template>
