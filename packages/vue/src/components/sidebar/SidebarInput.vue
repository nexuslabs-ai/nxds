<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { Input, type InputVariants } from '../input';

// `v-model` falls through to Input.
export interface SidebarInputProps {
  size?: InputVariants['size'];
  variant?: InputVariants['variant'];
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<SidebarInputProps>(), {
  size: 'default',
  variant: 'bordered',
});
</script>

<template>
  <Input
    data-slot="sidebar-input"
    :size="size"
    :variant="variant"
    :class="
      cn(
        'nx:h-8 nx:w-full nx:bg-background nx:autofill-bg-background',
        props.class
      )
    "
  />
</template>
