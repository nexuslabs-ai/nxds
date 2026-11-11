<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

import { toolbarGroupLayout } from '.';

export interface ToolbarGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ToolbarGroupProps>();
</script>

<template>
  <div
    role="group"
    data-slot="toolbar-group"
    :class="cn(toolbarGroupLayout, props.class)"
  >
    <slot />
  </div>
</template>
