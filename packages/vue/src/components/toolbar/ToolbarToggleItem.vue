<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  injectToggleGroupRootContext,
  ToolbarToggleItem,
  type ToolbarToggleItemProps as RekaToolbarToggleItemProps,
  useForwardProps,
} from 'reka-ui';
import { computed, type HTMLAttributes, type VNode } from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';
import { useToggleGroupSelectionAttrs } from '../toggle-group/toggle-group-selection';

export interface ToolbarToggleItemProps extends Omit<
  RekaToolbarToggleItemProps,
  'value'
> {
  /** Value the group reports while this item is pressed. */
  value: string;
  size?: ButtonVariants['size'];
  /**
   * Shows only `startIcon` in a square button. The text stays as the name
   * screen readers read, visually hidden.
   */
  iconOnly?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ToolbarToggleItemProps>(), {
  size: 'sm',
  iconOnly: false,
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
}>();

// `iconOnly` keeps the native button, as Button does.
const rendersAsChild = computed(() => props.asChild && !props.iconOnly);

const selectionAttrs = useToggleGroupSelectionAttrs(() => props.value);

// Reka's toolbar wrapper reads only the item's own disabled, so an item of a
// disabled group stays in the arrow-key order without data-disabled.
const group = injectToggleGroupRootContext();
const disabled = computed(() => group.disabled?.value || props.disabled);

const delegated = reactiveOmit(props, 'class', 'size', 'iconOnly');
const forwarded = useForwardProps(delegated);
</script>

<template>
  <ToolbarToggleItem
    v-bind="{ ...forwarded, ...selectionAttrs }"
    data-slot="toolbar-toggle-item"
    :disabled="disabled"
    :data-size="size"
    :data-icon-only="iconOnly || undefined"
    :class="
      cn(
        buttonVariants({ variant: 'ghost', size, iconOnly }),
        'nx:data-[state=on]:bg-primary-subtle nx:data-[state=on]:text-primary-subtle-foreground nx:data-[state=on]:hover:bg-primary-subtle-hover nx:data-[state=on]:active:bg-primary-subtle-active',
        props.class
      )
    "
    :as-child="rendersAsChild"
  >
    <slot v-if="rendersAsChild" />
    <template v-else>
      <span
        v-if="slots['start-icon']"
        aria-hidden="true"
        class="nx:inline-flex nx:shrink-0"
      >
        <slot name="start-icon" />
      </span>
      <span v-if="iconOnly" class="nx:sr-only"><slot /></span>
      <slot v-else />
    </template>
  </ToolbarToggleItem>
</template>
