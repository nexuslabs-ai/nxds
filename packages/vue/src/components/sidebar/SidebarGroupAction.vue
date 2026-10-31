<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarGroupActionProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarGroupActionProps>(), {
  as: 'button',
});
</script>

<template>
  <Primitive
    data-slot="sidebar-group-action"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:absolute nx:top-3.5 nx:right-3 nx:flex nx:aspect-square nx:w-5 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:p-0 nx:text-nav-foreground nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>svg]:size-icon-glyph-default nx:[&>svg]:shrink-0 nx:icon-stroke',
        'nx:group-data-[collapsible=icon]:hidden',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
