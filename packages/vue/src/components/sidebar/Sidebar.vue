<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../sheet';

import { useSidebar } from '.';

const SIDEBAR_WIDTH_NARROW = 'var(--nx-container-2xs)';

export interface SidebarProps {
  /**
   * Edge the sidebar docks to.
   */
  side?: 'left' | 'right';
  /**
   * Visual style. `inset` pairs with `SidebarInset` to show the main region as a
   * card.
   */
  variant?: 'sidebar' | 'floating' | 'inset';
  /**
   * How it collapses: slides off screen, shrinks to an icon rail, or never.
   */
  collapsible?: 'offcanvas' | 'icon' | 'none';
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SidebarProps>(), {
  side: 'left',
  variant: 'sidebar',
  collapsible: 'offcanvas',
});

const { isNarrow, state, openNarrow, setOpenNarrow } = useSidebar();

// The drawer opens from state, not a SheetTrigger, so it has no trigger to
// return focus to. Return it to whatever had focus when it opened.
let returnFocus: HTMLElement | null = null;

function rememberFocus() {
  const opener = document.activeElement;
  returnFocus = opener instanceof HTMLElement ? opener : null;
}

function restoreFocus(event: Event) {
  if (!returnFocus?.isConnected) return;
  event.preventDefault();
  returnFocus.focus();
}
</script>

<template>
  <div
    v-if="collapsible === 'none'"
    data-slot="sidebar"
    :class="
      cn(
        'nx:flex nx:h-full nx:w-(--sidebar-width) nx:flex-col nx:bg-nav-background nx:text-nav-foreground',
        props.class
      )
    "
    v-bind="$attrs"
  >
    <slot />
  </div>
  <Sheet v-else-if="isNarrow" :open="openNarrow" @update:open="setOpenNarrow">
    <SheetContent
      data-slot="sidebar"
      data-narrow="true"
      :side="side"
      :class="
        cn(
          'nx:inset-y-2 nx:h-auto nx:w-(--sidebar-width) nx:max-w-[calc(100vw-var(--nx-spacing-2)*2)] nx:rounded-lg nx:border-default nx:border-nav-border nx:bg-nav-background nx:p-0 nx:text-nav-foreground',
          side === 'left'
            ? 'nx:left-2 nx:data-[state=closed]:-translate-x-[calc(100%+var(--nx-spacing-2))]'
            : 'nx:right-2 nx:data-[state=closed]:translate-x-[calc(100%+var(--nx-spacing-2))]',
          props.class
        )
      "
      :style="{ '--sidebar-width': SIDEBAR_WIDTH_NARROW }"
      v-bind="$attrs"
      @open-auto-focus="rememberFocus"
      @close-auto-focus="restoreFocus"
    >
      <SheetHeader class="nx:sr-only">
        <SheetTitle>Sidebar</SheetTitle>
        <SheetDescription>Displays the narrow-tier sidebar.</SheetDescription>
      </SheetHeader>
      <div class="nx:flex nx:h-full nx:w-full nx:flex-col">
        <slot />
      </div>
    </SheetContent>
  </Sheet>
  <div
    v-else
    class="nx:group nx:peer nx:hidden nx:text-nav-foreground nx:md:block"
    :data-state="state"
    :data-collapsible="state === 'collapsed' ? collapsible : ''"
    :data-variant="variant"
    :data-side="side"
    data-slot="sidebar"
  >
    <div
      data-slot="sidebar-gap"
      :class="
        cn(
          'nx:relative nx:w-(--sidebar-width) nx:bg-transparent nx:transition-[width] nx:duration-default nx:ease-linear',
          'nx:group-data-[collapsible=offcanvas]:w-0',
          'nx:group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'nx:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--nx-spacing-2)*2)]'
            : 'nx:group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
        )
      "
    />
    <div
      data-slot="sidebar-container"
      :class="
        cn(
          'nx:fixed nx:inset-y-0 nx:z-sticky nx:hidden nx:h-svh nx:w-(--sidebar-width) nx:transition-[left,right,width] nx:duration-default nx:ease-linear nx:md:flex',
          side === 'left'
            ? 'nx:left-0 nx:group-data-[collapsible=offcanvas]:-left-(--sidebar-width)'
            : 'nx:right-0 nx:group-data-[collapsible=offcanvas]:-right-(--sidebar-width)',
          (variant === 'floating' || variant === 'inset') && 'nx:p-2',
          variant === 'floating' || variant === 'inset'
            ? 'nx:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+var(--nx-spacing-2)*2+var(--nx-borderwidth-default)*2)]'
            : 'nx:group-data-[collapsible=icon]:w-(--sidebar-width-icon) nx:group-data-[side=left]:border-r-default nx:group-data-[side=right]:border-l-default nx:border-nav-border',
          props.class
        )
      "
      v-bind="$attrs"
    >
      <div
        data-slot="sidebar-inner"
        class="nx:flex nx:h-full nx:w-full nx:flex-col nx:bg-nav-background nx:group-data-[variant=floating]:rounded-lg nx:group-data-[variant=floating]:border-default nx:group-data-[variant=floating]:border-nav-border nx:group-data-[variant=floating]:shadow-sm"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
