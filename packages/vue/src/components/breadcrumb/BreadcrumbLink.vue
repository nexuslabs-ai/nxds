<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BreadcrumbLinkProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<BreadcrumbLinkProps>(), { as: 'a' });
</script>

<template>
  <Primitive
    data-slot="breadcrumb-link"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:inline-flex nx:min-w-0 nx:max-w-[150px] nx:items-center nx:gap-1 nx:rounded-md nx:px-1.5 nx:text-inherit nx:no-underline nx:typography-label-default nx:transition-control nx:hover:bg-background-hover nx:active:bg-background-active nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>span]:min-w-0 nx:[&>span]:truncate nx:[&_svg]:size-icon-glyph-default nx:[&_svg]:shrink-0',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
