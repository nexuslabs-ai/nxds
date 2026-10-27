<script setup lang="ts">
import { Text, type VNode } from 'vue';

import { IconCheck } from '../../lib/icons';
import { renderedNodes } from '../../lib/slots';
import { cn } from '../../lib/utils';
import { CommandItem, type CommandItemProps } from '../command';

import { injectMultiSelect } from '.';

export interface MultiSelectItemProps extends Omit<
  CommandItemProps,
  'value' | 'keywords'
> {
  value: string;
  /** More words the search matches. Defaults to the option's text. */
  keywords?: string[];
}

const props = withDefaults(defineProps<MultiSelectItemProps>(), {
  disabled: false,
  forceMount: undefined,
});
const emit = defineEmits<{
  /**
   * Called with the option's value after it is toggled.
   */
  select: [value: string];
}>();
const slots = defineSlots<{
  default?: () => VNode[];
  /**
   * Chip text when it differs from the option content, such as an icon option.
   */
  'badge-label'?: () => VNode[];
}>();

const { selectedValues, toggle } = injectMultiSelect();

function handleSelect() {
  toggle(props.value);
  emit('select', props.value);
}

/** The option's text when its content is plain text, so the search finds it by its label. */
function searchKeywords() {
  if (props.keywords) return props.keywords;
  const nodes = renderedNodes(slots.default?.());
  if (!nodes.length || !nodes.every((node) => node.type === Text)) return;
  return [
    nodes
      .map((node) => String(node.children))
      .join('')
      .trim(),
  ];
}
</script>

<template>
  <CommandItem
    data-slot="multi-select-item"
    :data-checked="selectedValues.has(value) || undefined"
    :value="value"
    :keywords="searchKeywords()"
    :disabled="disabled"
    :force-mount="forceMount"
    :class="cn('nx:gap-2', props.class)"
    @select="handleSelect"
  >
    <span
      aria-hidden="true"
      data-slot="multi-select-indicator"
      :class="
        cn(
          'nx:flex nx:size-4 nx:shrink-0 nx:items-center nx:justify-center nx:rounded-sm nx:border-default nx:transition-colors',
          selectedValues.has(value)
            ? 'nx:border-transparent nx:bg-primary-background nx:text-primary-foreground'
            : 'nx:border-border-default nx:bg-background'
        )
      "
    >
      <IconCheck v-if="selectedValues.has(value)" class="nx:size-3" />
    </span>
    <span class="nx:min-w-0 nx:flex-1"><slot /></span>
  </CommandItem>
</template>
