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
  watchEffect,
} from 'vue';

import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

import { injectToolbarToolGroup } from './toolbar-tool-group';

export interface ToolbarToolProps extends RekaToolbarButtonProps {
  /** Matches the tool's ToolbarToolPanel, if it has one. */
  value: string;
  size?: ButtonVariants['size'];
  class?: HTMLAttributes['class'];
}

// The tool's own click runs after yours, so it can check defaultPrevented.
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ToolbarToolProps>(), {
  as: 'button',
  size: 'sm',
});

const tools = injectToolbarToolGroup();
const button = useTemplateRef('button');
const id = useId();
const selected = computed(() => props.value === tools.value.value);
const hasPanel = computed(() => tools.panels.has(props.value));
const expanded = computed(() => selected.value && tools.open.value);

const delegated = reactiveOmit(props, 'class', 'size', 'value');

watchEffect(
  (onCleanup) => {
    const element = unrefElement(button);
    if (!(element instanceof HTMLElement)) return;
    onCleanup(tools.registerTool(props.value, element));
  },
  { flush: 'post' }
);

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
    :class="
      cn(
        buttonVariants({ variant: 'ghost', size }),
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
    @click="handleClick"
  >
    <slot />
  </ToolbarButton>
</template>
