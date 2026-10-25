<script setup lang="ts">
import type { HTMLAttributes, VNode } from 'vue';

import { renderedNodes } from '../../lib/slots';
import { cn } from '../../lib/utils';
import { Separator } from '../separator';

export interface FieldSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<FieldSeparatorProps>();

const slots = defineSlots<{ default?: () => VNode[] }>();

function hasContent() {
  return renderedNodes(slots.default?.()).length > 0;
}
</script>

<template>
  <div
    data-slot="field-separator"
    :data-content="hasContent()"
    :class="
      cn('nx:relative nx:-my-2 nx:h-5 nx:typography-body-default', props.class)
    "
  >
    <Separator class="nx:absolute nx:inset-0 nx:top-1/2" />
    <span
      v-if="hasContent()"
      data-slot="field-separator-content"
      class="nx:relative nx:mx-auto nx:block nx:w-fit nx:bg-container nx:px-2 nx:text-muted-foreground"
    >
      <slot />
    </span>
  </div>
</template>
