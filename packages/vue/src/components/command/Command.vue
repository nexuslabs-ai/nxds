<script setup lang="ts">
import { ListboxRoot } from 'reka-ui';
import {
  computed,
  type ComputedRef,
  type HTMLAttributes,
  provide,
  ref,
  shallowReactive,
  toRef,
  useId,
  useTemplateRef,
} from 'vue';

import { commandScore } from '../../lib/command-score';
import { cn } from '../../lib/utils';

import { type CommandItemEntry, CommandKey } from '.';

export interface CommandProps {
  /** Accessible name for the search input. */
  label?: string;
  /** Hides the items the search doesn't match. Turn it off to filter items yourself. */
  shouldFilter?: boolean;
  /** Arrow keys wrap from the last item to the first, and back. */
  loop?: boolean;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<CommandProps>(), {
  shouldFilter: true,
  loop: false,
});

const search = ref('');
const items = shallowReactive(new Map<string, ComputedRef<CommandItemEntry>>());
const isFiltering = computed(() => props.shouldFilter && search.value !== '');

const scores = computed(() => {
  const scored = new Map<string, number>();
  if (!isFiltering.value) return scored;
  for (const [id, entry] of items) {
    const { value, keywords } = entry.value;
    scored.set(id, value ? commandScore(value, search.value, keywords) : 0);
  }
  return scored;
});

const matchingIds = computed(
  () =>
    new Set(
      [...scores.value].filter(([, score]) => score > 0).map(([id]) => id)
    )
);
const matchingGroups = computed(
  () => new Set([...matchingIds.value].map((id) => items.get(id)?.value.group))
);

function registerItem(id: string, entry: ComputedRef<CommandItemEntry>) {
  items.set(id, entry);
  return () => items.delete(id);
}

const inputId = useId();
const labelId = useId();

provide(CommandKey, {
  label: toRef(props, 'label'),
  search,
  inputId,
  labelId,
  listId: useId(),
  count: computed(() =>
    isFiltering.value ? matchingIds.value.size : items.size
  ),
  registerItem,
  isItemShown: (id) => !isFiltering.value || matchingIds.value.has(id),
  isGroupShown: (id) => !isFiltering.value || matchingGroups.value.has(id),
});

// Reka clears the highlight when the pointer leaves the list. Keep it, so
// Enter still runs the last highlighted item.
const listbox = useTemplateRef('listbox');
let lastHighlighted: HTMLElement | undefined;

function keepHighlight() {
  if (!listbox.value || !lastHighlighted?.isConnected) return;
  listbox.value.highlightedElement = lastHighlighted;
}
</script>

<template>
  <ListboxRoot
    ref="listbox"
    data-slot="command"
    cmdk-root
    tabindex="-1"
    :loop="loop"
    highlight-on-hover
    :class="
      cn(
        'nx:flex nx:h-full nx:w-full nx:flex-col nx:overflow-hidden nx:rounded-md',
        'nx:bg-popover nx:text-popover-foreground',
        props.class
      )
    "
    @highlight="lastHighlighted = $event?.ref"
    @leave="keepHighlight"
  >
    <label :id="labelId" :for="inputId" cmdk-label class="nx:sr-only">
      {{ label }}
    </label>
    <slot />
  </ListboxRoot>
</template>
