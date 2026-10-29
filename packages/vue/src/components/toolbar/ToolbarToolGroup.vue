<script setup lang="ts">
import { PopoverAnchor, PopoverRoot } from 'reka-ui';
import {
  computed,
  type HTMLAttributes,
  provide,
  ref,
  shallowReactive,
  useId,
  useTemplateRef,
} from 'vue';

import { cn } from '../../lib/utils';

import { ToolbarToolGroupKey } from './toolbar-tool-group';

import { toolbarGroupLayout } from '.';

export interface ToolbarToolGroupProps {
  /** The selected tool. */
  value?: string;
  defaultValue?: string;
  /** Whether the selected tool's panel is open. */
  open?: boolean;
  defaultOpen?: boolean;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ToolbarToolGroupProps>(), {
  defaultValue: '',
  open: undefined,
  defaultOpen: false,
});
const emit = defineEmits<{
  'value-change': [value: string];
  'open-change': [open: boolean];
}>();

const group = useTemplateRef<HTMLDivElement>('group');
const panelId = useId();
const localValue = ref(props.defaultValue);
const localOpen = ref(props.defaultOpen);
const tools = shallowReactive(new Map<string, HTMLElement>());
const panels = shallowReactive(new Set<string>());
let switching = false;
let restoreFocus = true;

const value = computed(() => props.value ?? localValue.value);
const activeTool = computed(() => tools.get(value.value) ?? null);
const open = computed(
  () =>
    (props.open ?? localOpen.value) &&
    panels.has(value.value) &&
    activeTool.value !== null
);

function registerTool(tool: string, element: HTMLElement) {
  tools.set(tool, element);
  return () => {
    if (tools.get(tool) === element) tools.delete(tool);
  };
}

function registerPanel(panel: string) {
  panels.add(panel);
  return () => {
    panels.delete(panel);
  };
}

function setOpen(next: boolean) {
  if (props.open === undefined) localOpen.value = next;
  emit('open-change', next);
}

function select(next: string) {
  const wasOpen = open.value;
  const nextOpen = panels.has(next) && (next !== value.value || !wasOpen);
  switching = wasOpen && nextOpen;
  if (next !== value.value) {
    if (props.value === undefined) localValue.value = next;
    emit('value-change', next);
  }
  if (nextOpen !== wasOpen) setOpen(nextOpen);
}

function handlePanelOpen() {
  restoreFocus = true;
  const keepFocusOnTool = switching;
  switching = false;
  return keepFocusOnTool;
}

// Reka reports the close while the panel still holds focus, so wait a task
// for focus to leave it, as Radix does.
function handlePanelClose() {
  setTimeout(() => {
    const tool = activeTool.value;
    if (!restoreFocus || !tool) return;
    // Focus falls to the body only when it was inside the closed panel.
    if (tool.ownerDocument.activeElement !== tool.ownerDocument.body) return;
    tool.focus({ preventScroll: true });
  });
}

function isInGroup(target: Node) {
  return group.value?.contains(target) ?? false;
}

function handlePressOutside() {
  restoreFocus = false;
}

provide(ToolbarToolGroupKey, {
  value,
  open,
  panelId,
  panels,
  activeTool,
  registerTool,
  registerPanel,
  select,
  handlePanelOpen,
  handlePanelClose,
  isInGroup,
  handlePressOutside,
});
</script>

<!-- The anchor renders nothing. It places the open panel at the selected tool. -->
<template>
  <PopoverRoot :open="open" @update:open="setOpen">
    <div
      ref="group"
      role="group"
      data-slot="toolbar-tool-group"
      v-bind="$attrs"
      :class="cn(toolbarGroupLayout, props.class)"
    >
      <slot />
    </div>
    <PopoverAnchor as-child :reference="activeTool ?? undefined" />
  </PopoverRoot>
</template>
