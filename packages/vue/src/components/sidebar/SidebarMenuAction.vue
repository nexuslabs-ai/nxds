<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuActionProps extends PrimitiveProps {
  /**
   * Shows the action only on hover or focus of the menu item.
   */
  showOnHover?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarMenuActionProps>(), {
  as: 'button',
  showOnHover: false,
});
</script>

<template>
  <Primitive
    data-slot="sidebar-menu-action"
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'nx:absolute nx:top-1.5 nx:right-1 nx:flex nx:aspect-square nx:w-5 nx:items-center nx:justify-center nx:rounded-md nx:border-0 nx:bg-transparent nx:p-0 nx:text-nav-foreground nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:[&>svg]:size-icon-glyph-default nx:[&>svg]:shrink-0',
        'nx:peer-data-[size=sm]/menu-button:top-1',
        'nx:peer-data-[size=default]/menu-button:top-1.5',
        'nx:peer-data-[size=lg]/menu-button:top-2.5',
        'nx:group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'nx:group-focus-within/menu-item:opacity-100 nx:group-hover/menu-item:opacity-100 nx:data-[state=open]:opacity-100 nx:md:opacity-0',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
