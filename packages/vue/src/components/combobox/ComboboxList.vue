<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { CommandList } from '../command';

export interface ComboboxListProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ComboboxListProps>();
</script>

<template>
  <CommandList data-slot="combobox-list" :class="props.class">
    <slot />
  </CommandList>
</template>
