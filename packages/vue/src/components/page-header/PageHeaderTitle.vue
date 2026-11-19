<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface PageHeaderTitleProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<PageHeaderTitleProps>(), { as: 'h1' });
</script>

<template>
  <Primitive
    data-slot="page-header-title"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:m-0 nx:wrap-anywhere nx:typography-heading-medium nx:text-balance nx:text-foreground',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
