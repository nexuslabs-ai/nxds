<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { CommandSeparator } from '../command';

export interface MultiSelectSeparatorProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<MultiSelectSeparatorProps>();
</script>

<template>
  <CommandSeparator data-slot="multi-select-separator" :class="props.class" />
</template>
