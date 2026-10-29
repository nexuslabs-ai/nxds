<script setup lang="ts">
import { type DateValue, getLocalTimeZone } from '@internationalized/date';
import { IconChevronDown } from '@tabler/icons-vue';
import {
  injectCalendarRootContext,
  injectRangeCalendarRootContext,
} from 'reka-ui';
import { computed } from 'vue';

import { cn } from '../../lib/utils';

import { injectDatePicker } from '.';

const props = defineProps<{ month: DateValue }>();

const datePicker = injectDatePicker();
const root =
  injectRangeCalendarRootContext(null) ?? injectCalendarRootContext(null);

const locale = computed(() => root?.locale.value);
const date = computed(() => props.month.toDate(getLocalTimeZone()));

const label = computed(() =>
  date.value.toLocaleString(locale.value, { month: 'long', year: 'numeric' })
);
const months = computed(() =>
  Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: new Date(2000, index, 1).toLocaleString(locale.value, {
      month: 'short',
    }),
  }))
);
// The years run between the bounds the DatePicker sets in dropdown layout.
const years = computed(() => {
  const first = root?.minValue.value?.year ?? datePicker.today.value.year;
  const last = root?.maxValue.value?.year ?? datePicker.today.value.year;
  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
});

function showMonth(event: Event) {
  const month = Number((event.target as HTMLSelectElement).value);
  root?.onPlaceholderChange(props.month.set({ month }));
}

function showYear(event: Event) {
  const year = Number((event.target as HTMLSelectElement).value);
  root?.onPlaceholderChange(props.month.set({ year }));
}

const dropdownRootClass =
  'nx:relative nx:rounded-md nx:border-default nx:border-border-default nx:shadow-xs nx:has-focus:border-border-focus';
const dropdownClass = 'nx:absolute nx:inset-0 nx:bg-popover nx:opacity-0';
const dropdownLabelClass = cn(
  'nx:typography-label-default nx:select-none',
  'nx:flex nx:h-8 nx:items-center nx:gap-1 nx:rounded-md nx:pr-1 nx:pl-2 nx:[&>svg]:size-icon-glyph-sm nx:[&>svg]:text-muted-foreground'
);
</script>

<template>
  <div
    class="nx:flex nx:h-(--cell-size) nx:w-full nx:items-center nx:justify-center nx:px-(--cell-size)"
  >
    <div
      v-if="datePicker.captionLayout.value === 'dropdown'"
      class="nx:flex nx:h-(--cell-size) nx:w-full nx:items-center nx:justify-center nx:gap-1.5 nx:typography-label-default"
    >
      <span :class="dropdownRootClass">
        <select
          aria-label="Choose the Month"
          :class="dropdownClass"
          :value="month.month"
          @change="showMonth"
        >
          <option
            v-for="option in months"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <span :class="dropdownLabelClass" aria-hidden="true">
          {{ months[month.month - 1]?.label }}
          <IconChevronDown class="nx:size-icon-glyph-default" />
        </span>
      </span>
      <span :class="dropdownRootClass">
        <select
          aria-label="Choose the Year"
          :class="dropdownClass"
          :value="month.year"
          @change="showYear"
        >
          <option v-for="year in years" :key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <span :class="dropdownLabelClass" aria-hidden="true">
          {{ month.year }}
          <IconChevronDown class="nx:size-icon-glyph-default" />
        </span>
      </span>
    </div>
    <span v-else class="nx:typography-label-default nx:select-none">
      {{ label }}
    </span>
  </div>
</template>
