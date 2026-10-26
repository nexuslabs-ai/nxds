<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { CommandInput } from '../command';

export interface ComboboxInputProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ComboboxInputProps>();
</script>

<template>
  <CommandInput data-slot="combobox-input" :class="props.class" />
</template>
