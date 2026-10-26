<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { CommandGroup } from '../command';

export interface ComboboxGroupProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ComboboxGroupProps>();
</script>

<template>
  <CommandGroup data-slot="combobox-group" :class="props.class">
    <slot />
  </CommandGroup>
</template>
