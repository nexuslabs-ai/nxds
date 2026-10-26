<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { CommandSeparator } from '../command';

export interface ComboboxSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ComboboxSeparatorProps>();
</script>

<template>
  <CommandSeparator data-slot="combobox-separator" :class="props.class" />
</template>
