<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface AttachmentTriggerProps extends PrimitiveProps {
  /**
   * Renders the child element instead, such as an `<a>` that opens the file.
   */
  asChild?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<AttachmentTriggerProps>(), {
  as: 'button',
  asChild: false,
});
</script>

<template>
  <!-- A consumer's type falls through over this default. -->
  <Primitive
    data-slot="attachment-trigger"
    :as="as"
    :as-child="asChild"
    :type="as === 'button' && !asChild ? 'button' : undefined"
    :class="
      cn(
        'nx:absolute nx:inset-0 nx:z-10 nx:cursor-pointer nx:rounded-[inherit] nx:border-0 nx:bg-transparent nx:p-0 nx:no-underline',
        'nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
