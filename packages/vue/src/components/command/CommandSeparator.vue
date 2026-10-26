<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectCommand } from '.';

export interface CommandSeparatorProps {
  /** Keeps the separator while a search is active. */
  alwaysRender?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CommandSeparatorProps>(), {
  alwaysRender: false,
});

const command = injectCommand();
</script>

<template>
  <div
    v-if="alwaysRender || !command.search.value"
    data-slot="command-separator"
    cmdk-separator
    role="separator"
    aria-hidden="true"
    :class="
      cn('nx:-mx-1 nx:my-1 nx:h-px nx:bg-border-default-alpha', props.class)
    "
  />
</template>
