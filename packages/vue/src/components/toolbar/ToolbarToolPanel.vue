<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  type FocusOutsideEvent,
  injectPopoverRootContext,
  type PointerDownOutsideEvent,
  type PopoverContentEmits,
  type PopoverContentProps as RekaPopoverContentProps,
  useForwardPropsEmits,
} from 'reka-ui';
import { computed, type HTMLAttributes, useAttrs, watchEffect } from 'vue';

import { PopoverContent } from '../popover';

import { injectToolbarToolGroup } from './toolbar-tool-group';

// vue-docgen-api fails on an interface that extends one from a local .vue
// file, so this repeats nxds PopoverContentProps: Reka's props and class.
export interface ToolbarToolPanelProps extends RekaPopoverContentProps {
  /** The ToolbarTool this panel belongs to. */
  value: string;
  class?: HTMLAttributes['class'];
}

const props = defineProps<ToolbarToolPanelProps>();
const emits = defineEmits<PopoverContentEmits>();

const tools = injectToolbarToolGroup();
const popover = injectPopoverRootContext();
const attrs = useAttrs();
const shown = computed(() => props.value === tools.value.value);

const delegated = reactiveOmit(props, 'value');
const forwarded = useForwardPropsEmits(delegated, emits);

watchEffect((onCleanup) => onCleanup(tools.registerPanel(props.value)));

// Reka sets the panel's id and aria-labelledby from these, over its attributes.
popover.contentId = tools.panelId;

/** The panel's own aria-labelledby, else its tool unless it has an aria-label. */
function labelledBy() {
  const own = attrs['aria-labelledby'];
  if (typeof own === 'string') return own;
  if (attrs['aria-label']) return undefined;
  return tools.activeTool.value?.id;
}

watchEffect(() => {
  // Reka types triggerId as a string, but leaving it unset omits the attribute.
  if (shown.value) popover.triggerId = labelledBy() as string;
});

function handleOpenAutoFocus(event: Event) {
  emits('openAutoFocus', event);
  // Switching tools keeps focus on the tool that was just chosen.
  if (tools.consumeSwitch(props.value)) event.preventDefault();
}

function handleCloseAutoFocus(event: Event) {
  emits('closeAutoFocus', event);
  if (event.defaultPrevented) return;
  event.preventDefault();
  tools.handlePanelClose();
}

function handleInteractOutside(
  event: PointerDownOutsideEvent | FocusOutsideEvent
) {
  emits('interactOutside', event);
  if (event.defaultPrevented) return;
  // Tools handle their own clicks, so the panel can stay open while switching.
  if (event.target instanceof Node && tools.isInGroup(event.target))
    event.preventDefault();
  else tools.handlePressOutside();
}

const bound = computed(() => ({
  ...forwarded.value,
  onOpenAutoFocus: handleOpenAutoFocus,
  onCloseAutoFocus: handleCloseAutoFocus,
  onInteractOutside: handleInteractOutside,
}));
</script>

<template>
  <PopoverContent v-if="shown" data-slot="toolbar-tool-panel" v-bind="bound">
    <slot />
  </PopoverContent>
</template>
