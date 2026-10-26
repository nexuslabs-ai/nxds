<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { CommandGroup } from '../command';

export interface MultiSelectGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MultiSelectGroupProps>();
</script>

<template>
  <CommandGroup data-slot="multi-select-group" :class="props.class">
    <slot />
  </CommandGroup>
</template>
