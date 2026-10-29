<script setup lang="ts">
import { injectListboxRootContext, ListboxItem } from 'reka-ui';
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  useId,
  useTemplateRef,
  watch,
} from 'vue';

import { cn } from '../../lib/utils';

import { CommandGroupKey, type CommandItemProps, injectCommand } from '.';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<CommandItemProps>(), {
  disabled: false,
  forceMount: undefined,
});
const emit = defineEmits<{ select: [value: string] }>();

const command = injectCommand();
const group = inject(CommandGroupKey, undefined);
const listbox = injectListboxRootContext();
const id = useId();

const element = useTemplateRef<HTMLElement>('element');
const text = ref('');

function readText() {
  const content = element.value?.textContent;
  if (content != null) text.value = content.trim();
}

onMounted(readText);
onUpdated(readText);

const entry = computed(() => ({
  value: props.value?.trim() ?? text.value,
  keywords: props.keywords?.map((keyword) => keyword.trim()) ?? [],
  group: group?.id,
}));

const forceMount = computed(
  () => props.forceMount ?? group?.forceMount.value ?? false
);

watch(
  forceMount,
  (forced, _, onCleanup) => {
    if (!forced) onCleanup(command.registerItem(id, entry));
  },
  { immediate: true }
);

const shown = computed(() => forceMount.value || command.isItemShown(id));
const highlighted = computed(
  () => !props.disabled && listbox.highlightedElement.value?.id === id
);

// A hidden item can't stay highlighted, or the input would point
// aria-activedescendant at an element that is gone.
function releaseHighlight() {
  if (highlighted.value) listbox.highlightedElement.value = null;
}

watch(shown, (isShown) => {
  if (!isShown) releaseHighlight();
});
onUnmounted(releaseHighlight);

// Set over Reka's own item attributes, so the item reads as cmdk's: selected
// means highlighted, and the disabled state is a "true" or "false" string.
const itemAttrs = computed(() => ({
  id,
  'cmdk-item': '',
  role: 'option',
  'aria-disabled': props.disabled,
  'aria-selected': highlighted.value,
  'data-disabled': props.disabled,
  'data-selected': highlighted.value,
  'data-value': entry.value.value,
  'data-highlighted': undefined,
  'data-state': undefined,
  class: cn(
    'nx:relative nx:flex nx:cursor-default nx:select-none nx:items-center nx:rounded-sm nx:typography-body-default nx:outline-none',
    'nx:gap-3 nx:px-3 nx:py-2.5',
    'nx:data-[selected=true]:bg-popover-hover nx:data-[selected=true]:text-popover-foreground',
    'nx:data-[disabled=true]:pointer-events-none nx:data-[disabled=true]:text-disabled-foreground',
    'nx:[&_svg]:pointer-events-none nx:[&_svg]:size-icon-glyph-default nx:[&_svg]:shrink-0',
    props.class
  ),
}));
</script>

<template>
  <!-- A hidden item still renders its content, so the search can read its text. -->
  <div v-if="!shown" ref="element" hidden>
    <slot />
  </div>
  <template v-else>
    <!-- A disabled item stays out of Reka's collection, so arrow keys skip it. -->
    <div
      v-if="disabled"
      ref="element"
      v-bind="{ 'data-slot': 'command-item', ...$attrs, ...itemAttrs }"
    >
      <slot />
    </div>
    <ListboxItem
      v-else
      :value="id"
      as-child
      @select="emit('select', entry.value)"
    >
      <div
        ref="element"
        v-bind="{ 'data-slot': 'command-item', ...$attrs, ...itemAttrs }"
      >
        <slot />
      </div>
    </ListboxItem>
  </template>
</template>
