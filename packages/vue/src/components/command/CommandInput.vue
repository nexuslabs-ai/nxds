<script setup lang="ts">
import { IconSearch } from '@tabler/icons-vue';
import { ListboxFilter } from 'reka-ui';
import { type HTMLAttributes, watch } from 'vue';

import { cn } from '../../lib/utils';

import { injectCommand } from '.';

export interface CommandInputProps {
  /** The search text. Bind it with `v-model` to read or set the search. */
  modelValue?: string;
  class?: HTMLAttributes['class'];
}

defineOptions({ inheritAttrs: false });

const props = defineProps<CommandInputProps>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const command = injectCommand();

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) command.search.value = value;
  },
  { immediate: true }
);

function updateSearch(value: string) {
  if (props.modelValue === undefined) command.search.value = value;
  emit('update:modelValue', value);
}
</script>

<template>
  <div
    data-slot="command-input-wrapper"
    class="nx:flex nx:items-center nx:border-b-default nx:border-border-default nx:px-3 nx:focus-within:border-border-focus"
  >
    <IconSearch class="nx:mr-2 nx:size-4 nx:shrink-0 nx:opacity-50" />
    <ListboxFilter
      v-bind="{ 'data-slot': 'command-input', ...$attrs }"
      :id="command.inputId"
      :model-value="command.search.value"
      cmdk-input
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded="true"
      :aria-controls="command.listId"
      :aria-labelledby="command.labelId"
      :class="
        cn(
          'nx:flex nx:w-full nx:border-0 nx:bg-transparent nx:px-0 nx:py-2 nx:text-inherit nx:typography-body-default nx:outline-none',
          'nx:placeholder:text-muted-foreground',
          'nx:disabled:cursor-not-allowed nx:disabled:text-disabled-foreground nx:disabled:placeholder:text-disabled-foreground',
          props.class
        )
      "
      @update:model-value="updateSearch"
    />
  </div>
</template>
