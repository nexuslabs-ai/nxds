<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface SidebarMenuSubButtonProps extends PrimitiveProps {
  /**
   * Text size of the sub-item.
   */
  size?: 'sm' | 'md';
  /**
   * Marks the sub-item as the current page.
   */
  isActive?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarMenuSubButtonProps>(), {
  as: 'a',
  size: 'md',
  isActive: false,
});
</script>

<template>
  <Primitive
    data-slot="sidebar-menu-sub-button"
    :as="as"
    :as-child="asChild"
    :data-size="size"
    :data-active="isActive"
    :aria-current="isActive ? 'page' : undefined"
    :class="
      cn(
        'nx:flex nx:h-7 nx:min-w-0 nx:-translate-x-px nx:items-center nx:gap-2 nx:overflow-hidden nx:rounded-md nx:px-2 nx:text-nav-muted-foreground nx:no-underline nx:hover:bg-nav-item-hover nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:active:bg-nav-item-active nx:disabled:pointer-events-none nx:disabled:text-disabled-foreground nx:aria-disabled:pointer-events-none nx:aria-disabled:text-disabled-foreground nx:[&>span:last-child]:truncate nx:[&>svg]:size-4 nx:[&>svg]:shrink-0 nx:icon-stroke',
        'nx:data-[active=true]:bg-nav-item-active nx:data-[active=true]:text-nav-foreground',
        size === 'sm' && 'nx:typography-body-small',
        size === 'md' && 'nx:typography-body-default',
        'nx:group-data-[collapsible=icon]:hidden',
        props.class
      )
    "
  >
    <slot />
  </Primitive>
</template>
