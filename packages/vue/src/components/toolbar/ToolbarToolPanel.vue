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
watchEffect(() => {
  if (!shown.value) return;
  popover.triggerId = attrs['aria-label']
    ? ''
    : (tools.activeTool.value?.id ?? '');
});

function handleOpenAutoFocus(event: Event) {
  emits('openAutoFocus', event);
  // Switching tools keeps focus on the tool that was just chosen.
  if (tools.handlePanelOpen()) event.preventDefault();
}

// Reka's non-modal content reports each close and outside interaction twice,
// with the same event.
const reported = new WeakSet<Event>();

function handleCloseAutoFocus(event: Event) {
  if (reported.has(event)) return;
  reported.add(event);
  emits('closeAutoFocus', event);
  if (event.defaultPrevented) return;
  event.preventDefault();
  tools.handlePanelClose();
}

function handleInteractOutside(
  event: PointerDownOutsideEvent | FocusOutsideEvent
) {
  if (reported.has(event)) return;
  reported.add(event);
  emits('interactOutside', event);
  if (event.defaultPrevented) return;
  // Tools handle their own clicks, so the panel can stay open while switching.
  if (tools.isInGroup(event.target as Node)) event.preventDefault();
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
