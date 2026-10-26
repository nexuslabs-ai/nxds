<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { CommandEmpty } from '../command';

export interface ComboboxEmptyProps {
  class?: HTMLAttributes['class'];
}

const props = defineProps<ComboboxEmptyProps>();
</script>

<template>
  <CommandEmpty
    data-slot="combobox-empty"
    :class="cn('nx:text-muted-foreground', props.class)"
  >
    <slot />
  </CommandEmpty>
</template>
