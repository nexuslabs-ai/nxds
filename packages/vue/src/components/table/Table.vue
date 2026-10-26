<script setup lang="ts">
import { type HTMLAttributes, provide } from 'vue';

import { cn } from '../../lib/utils';

import { TableKey } from '.';

defineOptions({ inheritAttrs: false });

export interface TableProps {
  /**
   * Lines inside the table.
   *
   * - `default`: row lines and a header underline.
   * - `borderless`: no lines.
   * - `grid`: row and column lines.
   */
  variant?: 'default' | 'borderless' | 'grid';
  /**
   * Row height.
   *
   * - `comfortable`: about 44px rows.
   * - `compact`: about 36px rows, for dense data.
   */
  density?: 'comfortable' | 'compact';
  /**
   * Keeps the header row in view while the body scrolls. Set a max height with
   * `containerClassName`, such as `"nx:max-h-96"`.
   */
  stickyHeader?: boolean;
  /**
   * Tints every other body row. Hover and selection colors win over the stripe.
   */
  striped?: boolean;
  /**
   * Classes for the scroll container, such as a max height. `className` goes on
   * the `<table>`.
   */
  containerClassName?: string;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<TableProps>(), {
  variant: 'default',
  density: 'comfortable',
  stickyHeader: false,
  striped: false,
});

provide(TableKey, props);

// A wide table overflows horizontally and holds no focusable children, so the
// container takes tabindex="0" to scroll into view (WCAG 2.1.1).
</script>

<template>
  <div
    data-slot="table-container"
    tabindex="0"
    :class="
      cn(
        'nx:w-full nx:overflow-x-auto nx:focus-visible:outline-2 nx:focus-visible:outline-focus-default nx:focus-visible:[outline-offset:-2px]',
        stickyHeader && 'nx:overflow-y-auto',
        containerClassName
      )
    "
  >
    <table
      v-bind="$attrs"
      data-slot="table"
      :data-variant="variant"
      :data-table-density="density"
      :data-sticky-header="stickyHeader || undefined"
      :data-striped="striped || undefined"
      :class="
        cn(
          'nx:w-full nx:caption-bottom nx:border-collapse nx:typography-body-default nx:[&[data-striped]_tbody_tr:nth-child(even):not(:hover):not([data-state=selected])]:bg-muted nx:[&[data-striped]_tfoot]:border-t-default nx:[&[data-striped]_tfoot]:border-border-default-alpha',
          props.class
        )
      "
    >
      <slot />
    </table>
  </div>
</template>
