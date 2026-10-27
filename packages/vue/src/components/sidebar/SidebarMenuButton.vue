<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { computed, type HTMLAttributes, ref, type VNode } from 'vue';

import { cn } from '../../lib/utils';
import {
  Tooltip,
  TooltipContent,
  type TooltipContentProps,
  TooltipTrigger,
} from '../tooltip';

import {
  type SidebarMenuButtonVariants,
  sidebarMenuButtonVariants,
  useSidebar,
} from '.';

export interface SidebarMenuButtonProps extends PrimitiveProps {
  /**
   * Marks the item as the current page.
   */
  isActive?: boolean;
  variant?: SidebarMenuButtonVariants['variant'];
  size?: SidebarMenuButtonVariants['size'];
  /**
   * Tooltip shown only on the icon rail. A string or `TooltipContent` props.
   */
  tooltip?: string | TooltipContentProps;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SidebarMenuButtonProps>(), {
  as: 'button',
  isActive: false,
  variant: 'default',
  size: 'default',
});

// Unless `tooltip` is a string, the tooltip text goes in this slot.
defineSlots<{
  default?: () => VNode[];
  tooltip?: () => VNode[];
}>();

const { isNarrow, state } = useSidebar();
const isRail = computed(() => state.value === 'collapsed' && !isNarrow.value);
const open = ref(false);

const button = computed(() => ({
  as: props.as,
  asChild: props.asChild,
  'data-slot': 'sidebar-menu-button',
  'data-variant': props.variant,
  'data-size': props.size,
  'data-active': props.isActive,
  'aria-current': props.isActive ? ('page' as const) : undefined,
  class: cn(
    sidebarMenuButtonVariants({ variant: props.variant, size: props.size }),
    props.class
  ),
}));
</script>

<template>
  <Tooltip
    v-if="tooltip || $slots.tooltip"
    :open="open && isRail"
    @update:open="open = $event"
  >
    <TooltipTrigger as-child>
      <Primitive v-bind="{ ...button, ...$attrs }">
        <slot />
      </Primitive>
    </TooltipTrigger>
    <TooltipContent
      side="right"
      align="center"
      v-bind="typeof tooltip === 'object' ? tooltip : {}"
    >
      <template v-if="typeof tooltip === 'string'">{{ tooltip }}</template>
      <slot v-else name="tooltip" />
    </TooltipContent>
  </Tooltip>
  <Primitive v-else v-bind="{ ...button, ...$attrs }">
    <slot />
  </Primitive>
</template>
