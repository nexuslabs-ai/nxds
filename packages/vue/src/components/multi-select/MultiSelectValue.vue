<script setup lang="ts">
import { IconX } from '@tabler/icons-vue';
import {
  useDebounceFn,
  useMutationObserver,
  useResizeObserver,
} from '@vueuse/core';
import {
  computed,
  type FunctionalComponent,
  type HTMLAttributes,
  ref,
  useTemplateRef,
  type VNode,
} from 'vue';

import { cn } from '../../lib/utils';
import { Badge } from '../badge';

import { injectMultiSelect } from '.';

export interface MultiSelectValueProps {
  /**
   * Shows each selected value as a removable chip.
   */
  clickToRemove?: boolean;
  /**
   * What chips do when they overflow the field:
   * - `wrap`: wrap onto more lines.
   * - `wrap-when-open`: wrap while the list is open, show `+N` when closed.
   * - `cutoff`: always show the extra chips as a `+N` badge.
   */
  overflowBehavior?: 'wrap' | 'wrap-when-open' | 'cutoff';
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<MultiSelectValueProps>(), {
  clickToRemove: true,
  overflowBehavior: 'wrap-when-open',
});
defineSlots<{
  /**
   * Shown when nothing is selected.
   */
  placeholder?: () => VNode[];
}>();

const { selectedValues, labels, open, toggle } = injectMultiSelect();
const overflowAmount = ref(0);
const container = useTemplateRef<HTMLDivElement>('container');

const shouldWrap = computed(
  () =>
    props.overflowBehavior === 'wrap' ||
    (props.overflowBehavior === 'wrap-when-open' && open.value)
);

/**
 * Hides chips from the end of `container` until the row stops overflowing,
 * and returns how many it hid.
 */
function hideOverflowingChips(container: HTMLDivElement) {
  const chips = container.querySelectorAll<HTMLElement>('[data-selected-item]');

  // Reset to the fully-expanded state first; the count becomes the `+N` badge,
  // whose visibility is driven from that count in render (single source).
  chips.forEach((chip) => chip.style.removeProperty('display'));

  let amount = 0;

  for (let i = chips.length - 1; i >= 0; i--) {
    const chip = chips[i];

    if (!chip) continue;
    if (container.scrollWidth <= container.clientWidth) break;

    amount = chips.length - i;
    chip.style.display = 'none';
  }

  return amount;
}

function check() {
  if (container.value)
    overflowAmount.value = hideOverflowingChips(container.value);
}

useMutationObserver(container, check, {
  childList: true,
  attributes: true,
  attributeFilter: ['class', 'style'],
});
useResizeObserver(container, useDebounceFn(check, 100));

function removeChip(event: MouseEvent, value: string) {
  event.stopPropagation();
  toggle(value);
}

// Reads every option's label in one walk of MultiSelect's slot per render.
const WithLabels: FunctionalComponent<
  Record<string, never>,
  [],
  { default: (props: { labels: ReturnType<typeof labels> }) => VNode[] }
> = (_, { slots }) => slots.default({ labels: labels() });

const ChipLabel: FunctionalComponent<{
  label: (() => VNode[]) | undefined;
  value: string;
}> = ({ label, value }) => label?.() ?? value;
</script>

<template>
  <span
    v-if="selectedValues.size === 0"
    data-slot="multi-select-placeholder"
    class="nx:truncate nx:text-muted-foreground"
  >
    <slot name="placeholder">Select options</slot>
  </span>
  <div
    v-else
    ref="container"
    data-slot="multi-select-value"
    :class="
      cn(
        'nx:flex nx:min-w-0 nx:flex-1 nx:items-center nx:gap-1.5 nx:overflow-hidden',
        shouldWrap && 'nx:h-full nx:flex-wrap',
        props.class
      )
    "
  >
    <WithLabels v-slot="{ labels: chipLabels }">
      <Badge
        v-for="value in selectedValues"
        :key="value"
        data-slot="multi-select-chip"
        data-selected-item="true"
        variant="secondary"
        fill="outline"
        :is-caps="false"
        :class="
          cn(
            'nx:group/chip nx:max-w-40 nx:gap-1',
            clickToRemove && 'nx:cursor-pointer'
          )
        "
        @click="clickToRemove ? removeChip($event, value) : undefined"
      >
        <span class="nx:truncate"
          ><ChipLabel :label="chipLabels.get(value)" :value="value"
        /></span>
        <IconX
          v-if="clickToRemove"
          aria-hidden="true"
          class="nx:size-3 nx:text-muted-foreground nx:transition-colors nx:group-hover/chip:text-error-subtle-foreground"
        />
      </Badge>
    </WithLabels>
    <Badge
      data-slot="multi-select-overflow"
      variant="secondary"
      fill="light"
      :is-caps="false"
      :style="{
        display: shouldWrap || overflowAmount === 0 ? 'none' : undefined,
      }"
      >+{{ overflowAmount }}</Badge
    >
  </div>
</template>
