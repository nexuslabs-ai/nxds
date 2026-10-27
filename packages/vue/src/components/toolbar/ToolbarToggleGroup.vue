<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import {
  type AcceptableValue,
  ToolbarToggleGroup,
  type ToolbarToggleGroupProps as RekaToolbarToggleGroupProps,
  useForwardProps,
} from 'reka-ui';
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';

export interface ToolbarToggleGroupProps extends RekaToolbarToggleGroupProps {
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<ToolbarToggleGroupProps>();
// Clearing a single selection emits undefined.
const emits = defineEmits<{
  'update:modelValue': [value: string | string[] | undefined];
}>();

const delegated = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegated);

// Every item's value is a string, so Reka reports only strings.
function update(value: AcceptableValue | AcceptableValue[]) {
  emits('update:modelValue', value as string | string[] | undefined);
}
</script>

<!-- Reka's group sets role="group" on its own element, so it renders this div,
whose role wins. -->
<template>
  <ToolbarToggleGroup v-bind="forwarded" as-child @update:model-value="update">
    <div
      v-bind="$attrs"
      data-slot="toolbar-toggle-group"
      :role="type === 'single' ? 'radiogroup' : 'group'"
      :class="
        cn(
          'nx:flex nx:min-w-0 nx:flex-wrap nx:items-center nx:gap-0.5 nx:data-[orientation=vertical]:flex-col nx:data-[orientation=vertical]:items-stretch',
          props.class
        )
      "
    >
      <slot />
    </div>
  </ToolbarToggleGroup>
</template>
