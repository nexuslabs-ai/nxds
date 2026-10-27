<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { injectCommand } from '.';

export interface CommandEmptyProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<CommandEmptyProps>();

const command = injectCommand();
</script>

<template>
  <div
    v-if="command.count.value === 0"
    data-slot="command-empty"
    cmdk-empty
    role="presentation"
    :class="
      cn('nx:py-6 nx:text-center nx:typography-body-default', props.class)
    "
  >
    <slot />
  </div>
</template>
