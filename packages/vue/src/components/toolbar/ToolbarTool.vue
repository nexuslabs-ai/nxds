<script setup lang="ts">
import { reactiveOmit, unrefElement } from '@vueuse/core';
import {
  ToolbarButton,
  type ToolbarButtonProps as RekaToolbarButtonProps,
} from 'reka-ui';
import {
  computed,
  type HTMLAttributes,
  useId,
  useTemplateRef,
  type VNode,
  watchEffect,
} from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

import { injectToolbarToolGroup } from './toolbar-tool-group';

export interface ToolbarToolProps extends RekaToolbarButtonProps {
  /** Matches the tool's ToolbarToolPanel, if it has one. */
  value: string;
  size?: ButtonVariants['size'];
  /**
   * Shows only `startIcon` in a square button. The text stays as the name
   * screen readers read, visually hidden.
   */
  iconOnly?: boolean;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ToolbarToolProps>(), {
  as: 'button',
  size: 'sm',
  iconOnly: false,
});

const slots = defineSlots<{
  default?: () => VNode[];
  'start-icon'?: () => VNode[];
}>();

// `iconOnly` keeps the native button, as Button does.
const rendersAsChild = computed(() => props.asChild && !props.iconOnly);

const tools = injectToolbarToolGroup();
const button = useTemplateRef('button');
const id = useId();
const selected = computed(() => props.value === tools.value.value);
const hasPanel = computed(() => tools.panels.has(props.value));
const expanded = computed(() => selected.value && tools.open.value);

const delegated = reactiveOmit(props, 'class', 'size', 'value', 'iconOnly');

watchEffect(
  (onCleanup) => {
    const element = unrefElement(button);
    if (!selected.value || !(element instanceof HTMLElement)) return;
    tools.setActiveTool(element);
    onCleanup(() => {
      // The next selected tool may already have reported itself.
      if (tools.activeTool.value === element) tools.setActiveTool(null);
    });
  },
  { flush: 'post' }
);

// @click is bound after $attrs, so your click runs first and can prevent this.
function handleClick(event: MouseEvent) {
  if (!event.defaultPrevented) tools.select(props.value);
}
</script>

<template>
  <ToolbarButton
    :id="id"
    ref="button"
    data-slot="toolbar-tool"
    :data-size="size"
    :data-icon-only="iconOnly || undefined"
    :class="
      cn(
        buttonVariants({ variant: 'ghost', size, iconOnly }),
        'nx:data-[state=on]:bg-primary-background nx:data-[state=on]:text-primary-foreground nx:data-[state=on]:hover:bg-primary-background-hover nx:data-[state=on]:active:bg-primary-background-active',
        props.class
      )
    "
    v-bind="{ ...delegated, ...$attrs }"
    :data-state="selected ? 'on' : 'off'"
    :aria-pressed="selected"
    :aria-haspopup="hasPanel ? 'dialog' : undefined"
    :aria-expanded="hasPanel ? expanded : undefined"
    :aria-controls="expanded ? tools.panelId : $attrs['aria-controls']"
    :as-child="rendersAsChild"
    @click="handleClick"
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
  </ToolbarButton>
</template>
