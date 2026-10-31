<script setup lang="ts">
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { computed, type HTMLAttributes, inject, type VNode } from 'vue';

import { renderedNodes } from '../../lib/slots';
import { cn } from '../../lib/utils';
import { ButtonGroupKey } from '../button-group/button-group-context';
import Spinner from '../spinner/Spinner.vue';

import { type ButtonVariants, buttonVariants } from '.';

export interface ButtonProps extends PrimitiveProps {
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  /**
   * Shows only `startIcon` in a square button. The text stays as the name
   * screen readers read, visually hidden.
   */
  iconOnly?: boolean;
  /** Disables the button and shows a spinner in place of its content. */
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<ButtonProps>(), {
  as: 'button',
  variant: 'default',
  iconOnly: false,
  loading: false,
  type: 'button',
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
  'end-icon'?: () => VNode[];
}>();

const group = inject(ButtonGroupKey, undefined);
const size = computed(() => props.size ?? group?.size ?? 'default');
const isDisabled = computed(() => props.disabled || props.loading);
// `type` and `disabled` mean nothing on another tag, which also stays focusable.
const isNativeButton = computed(() => props.as === 'button');
const sharedAttrs = computed(() => ({
  'data-slot': 'button',
  'data-variant': props.variant,
  'data-size': size.value,
  'data-icon-only': props.iconOnly || undefined,
  'data-loading': props.loading || undefined,
  class: cn(
    buttonVariants({
      variant: props.variant,
      size: size.value,
      iconOnly: props.iconOnly,
    }),
    props.class
  ),
  'aria-busy': props.loading || undefined,
  'aria-disabled': isDisabled.value || undefined,
}));

// `asChild` clones onto a single child element; any other child keeps the
// native `<button>`, as React's Slot does. `iconOnly` also keeps it.
function rendersAsChild() {
  if (!props.asChild || props.iconOnly) return false;
  const nodes = renderedNodes(slots.default?.());
  return nodes.length === 1 && typeof nodes[0]?.type !== 'symbol';
}
</script>

<template>
  <Primitive
    v-if="rendersAsChild()"
    v-bind="sharedAttrs"
    as-child
    :tabindex="isDisabled ? -1 : undefined"
  >
    <slot />
  </Primitive>
  <Primitive
    v-else
    v-bind="sharedAttrs"
    :as="as"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? isDisabled : undefined"
    :tabindex="!isNativeButton && isDisabled ? -1 : undefined"
  >
    <span
      v-if="loading"
      data-slot="button-loading-content"
      class="nx:relative nx:inline-flex nx:items-center nx:justify-center"
    >
      <span data-slot="button-loading-label" class="nx:opacity-0">
        <span v-if="iconOnly" class="nx:sr-only"><slot /></span>
        <slot v-else />
      </span>
      <Spinner
        aria-hidden="true"
        class="nx:absolute nx:left-1/2 nx:top-1/2 nx:-translate-x-1/2 nx:-translate-y-1/2"
      />
    </span>
    <template v-else>
      <span
        v-if="slots['start-icon']"
        aria-hidden="true"
        data-slot="button-start-icon"
        class="nx:inline-flex nx:shrink-0"
      >
        <slot name="start-icon" />
      </span>
      <span v-if="iconOnly" class="nx:sr-only"><slot /></span>
      <slot v-else />
      <span
        v-if="slots['end-icon'] && !iconOnly"
        aria-hidden="true"
        data-slot="button-end-icon"
        class="nx:inline-flex nx:shrink-0"
      >
        <slot name="end-icon" />
      </span>
    </template>
  </Primitive>
</template>
