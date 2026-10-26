<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { codeBlockDiffClasses } from '.';

export interface CodeBlockLineProps {
  /** Line number to show in the gutter. Leave it out to show no number. */
  number?: number;
  /** Shades the line to draw the eye to it, such as the line a step runs. */
  highlighted?: boolean;
  /**
   * Colours the line's edge to mark a result. Give the result in text as
   * well, because some readers can't see the colour.
   */
  status?: 'success' | 'error';
  /**
   * Marks the line as added or removed in a diff. The line gets a green or
   * red tint and a `+` or `−` before the code. The copy button leaves out
   * removed lines.
   */
  diff?: 'added' | 'removed';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CodeBlockLineProps>(), {
  highlighted: false,
});
</script>

<template>
  <span
    data-slot="code-block-line"
    :data-number="number"
    :data-highlighted="highlighted || undefined"
    :data-status="status"
    :data-diff="diff"
    :class="
      cn(
        'nx:col-span-full nx:grid nx:min-h-lh nx:grid-cols-subgrid nx:border-width-s-thick nx:border-transparent nx:px-4 nx:transition-colors nx:duration-fast',
        'nx:before:text-end nx:before:text-muted-foreground-subtle nx:before:content-[attr(data-number)] nx:data-number:before:me-4',
        'nx:data-highlighted:not-data-diff:bg-container-hover nx:data-highlighted:before:text-muted-foreground nx:data-highlighted:not-data-status:border-foreground',
        'nx:data-[status=error]:border-error-subtle-foreground nx:data-[status=success]:border-success-subtle-foreground',
        codeBlockDiffClasses,
        'nx:group-has-data-[slot=code-block-copy-button]/code-block:pe-14',
        props.class
      )
    "
    ><span class="nx:col-start-3"><slot /></span>{{ '\n' }}</span
  >
</template>
