<script setup lang="ts">
import { useEventListener, useMediaQuery } from '@vueuse/core';
import { computed, type HTMLAttributes, provide, ref } from 'vue';

import { cn } from '../../lib/utils';
import TooltipProvider from '../tooltip/TooltipProvider.vue';

import { SidebarKey } from './sidebar-context';

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/** Whether the event target is a text-entry element (input, textarea, or contenteditable). */
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA'
  );
}

export interface SidebarProviderProps {
  /**
   * Opens the sidebar on first render when uncontrolled. The open state is saved
   * to a `sidebar_state` cookie. Read that cookie on the server and pass it here
   * to restore it.
   */
  defaultOpen?: boolean;
  /**
   * Controlled open state.
   */
  open?: boolean;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SidebarProviderProps>(), {
  defaultOpen: true,
  open: undefined,
});
const emit = defineEmits<{
  /**
   * Called when the open state changes.
   */
  'open-change': [open: boolean];
}>();

// The Narrow tier: viewports below `md` (48rem), where the sidebar is a Sheet.
const isNarrow = useMediaQuery('(max-width: 47.99rem)');
const openNarrow = ref(false);

// Internal open state; the `open` prop takes over when controlled.
const uncontrolledOpen = ref(props.defaultOpen);
const open = computed(() => props.open ?? uncontrolledOpen.value);

function setOpen(value: boolean | ((value: boolean) => boolean)) {
  const openState = typeof value === 'function' ? value(open.value) : value;
  emit('open-change', openState);
  if (props.open !== undefined) return;

  uncontrolledOpen.value = openState;
  // Persist non-sensitive uncontrolled open state for server-side restore.
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
}

function setOpenNarrow(value: boolean) {
  openNarrow.value = value;
}

function toggleSidebar() {
  if (isNarrow.value) setOpenNarrow(!openNarrow.value);
  else setOpen((value) => !value);
}

useEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key !== SIDEBAR_KEYBOARD_SHORTCUT) return;
  if (!event.metaKey && !event.ctrlKey) return;
  // Don't hijack Cmd/Ctrl+B (native bold) while typing in an editor.
  if (isEditableTarget(event.target)) return;

  event.preventDefault();
  toggleSidebar();
});

// Drives data-state="expanded" | "collapsed" for the parts' styling hooks.
const state = computed(() => (open.value ? 'expanded' : 'collapsed'));

provide(SidebarKey, {
  state,
  open,
  setOpen,
  isNarrow,
  openNarrow,
  setOpenNarrow,
  toggleSidebar,
});
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <div
      data-slot="sidebar-wrapper"
      :style="{
        '--sidebar-width': SIDEBAR_WIDTH,
        '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
      }"
      :class="
        cn(
          'nx:group/sidebar-wrapper nx:flex nx:min-h-svh nx:w-full nx:has-data-[variant=inset]:bg-nav-background',
          props.class
        )
      "
      v-bind="$attrs"
    >
      <slot />
    </div>
  </TooltipProvider>
</template>
