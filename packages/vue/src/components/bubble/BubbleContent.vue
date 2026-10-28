<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface BubbleContentProps extends PrimitiveProps {
  /**
   * Renders the child element instead, such as `p`, `a` or `button`.
   * An actionable child gets the focus ring and pointer cursor.
   */
  asChild?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<BubbleContentProps>(), {
  as: 'div',
  asChild: false,
});
</script>

<template>
  <Primitive
    data-slot="bubble-content"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:m-0 nx:block nx:min-w-0 nx:rounded-[inherit] nx:border-0 nx:bg-transparent nx:px-4 nx:py-3 nx:[font:inherit] nx:text-inherit nx:no-underline nx:text-start nx:wrap-break-word nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&:is(a[href],button:not(:disabled)):not([aria-disabled=true])]:cursor-pointer nx:[&:is(a[href]),&_:where(a[href])]:underline nx:[&_:where(a[href])]:text-inherit nx:[&:is(a[href]),&_:where(a[href])]:underline-offset-4 nx:[&_:where(pre)]:whitespace-pre-wrap nx:[&_:where(pre)]:wrap-break-word',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
