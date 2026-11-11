<script setup lang="ts">
import { PopoverAnchor, PopoverRoot } from 'reka-ui';
import {
  computed,
  type HTMLAttributes,
  provide,
  ref,
  shallowReactive,
  shallowRef,
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
const panels = shallowReactive(new Set<string>());
const activeTool = shallowRef<HTMLElement | null>(null);
let switchingTo: string | null = null;
let restoreFocus = true;

const value = computed(() => props.value ?? localValue.value);
const open = computed(
  () =>
    (props.open ?? localOpen.value) &&
    panels.has(value.value) &&
    activeTool.value !== null
);

function setActiveTool(tool: HTMLElement | null) {
  activeTool.value = tool;
}

function registerPanel(panelValue: string) {
  panels.add(panelValue);
  return () => {
    panels.delete(panelValue);
  };
}

function setOpen(next: boolean) {
  if (props.open === undefined) localOpen.value = next;
  emit('open-change', next);
}

function select(next: string) {
  const wasOpen = open.value;
  const nextOpen = panels.has(next) && (next !== value.value || !wasOpen);
  switchingTo = wasOpen && nextOpen ? next : null;
  if (next !== value.value) {
    if (props.value === undefined) localValue.value = next;
    emit('value-change', next);
  }
  if (nextOpen !== wasOpen) setOpen(nextOpen);
}

function consumeSwitch(panelValue: string) {
  const switched = switchingTo === panelValue;
  switchingTo = null;
  return switched;
}

// Reka reports the close while the panel still holds focus, so wait a task
// for focus to leave it, as Radix does.
function handlePanelClose() {
  const restore = restoreFocus;
  restoreFocus = true;
  setTimeout(() => {
    const tool = activeTool.value;
    if (!restore || !tool) return;
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
  setActiveTool,
  registerPanel,
  select,
  consumeSwitch,
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
