<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarGroupLabelProps extends PrimitiveProps {
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarGroupLabelProps>(), {
  as: 'div',
});
</script>

<template>
  <Primitive
    data-slot="sidebar-group-label"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:flex nx:h-8 nx:shrink-0 nx:items-center nx:rounded-md nx:px-2 nx:typography-label-small nx:text-nav-muted-foreground nx:transition-[margin,opacity] nx:duration-default nx:ease-linear nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>svg]:size-4 nx:[&>svg]:shrink-0',
        'nx:group-data-[collapsible=icon]:-mt-8 nx:group-data-[collapsible=icon]:opacity-0',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
