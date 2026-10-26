<script setup lang="ts">
import {
  type DateValue,
  isSameDay,
  isSameMonth,
} from '@internationalized/date';
import {
  CalendarCell,
  injectCalendarRootContext,
  injectRangeCalendarRootContext,
  RangeCalendarCell,
} from 'reka-ui';
import { computed, ref } from 'vue';

import { cn } from '../../lib/utils';

import DatePickerDayButton from './DatePickerDayButton.vue';

import { type DatePickerDayModifiers, injectDatePicker } from '.';

const props = defineProps<{ day: DateValue; month: DateValue }>();

const datePicker = injectDatePicker();
const calendar = injectCalendarRootContext(null);
const range = injectRangeCalendarRootContext(null);
const focused = ref(false);

function selection(day: DateValue) {
  if (!range) {
    return {
      selected: calendar?.isDateSelected(day) ?? false,
      rangeStart: false,
      rangeMiddle: false,
      rangeEnd: false,
      preview: false,
    };
  }
  const inRange = range.isSelected(day);
  const rangeStart = range.isSelectionStart(day);
  const rangeEnd = range.isSelectionEnd(day);
  const highlighted = range.highlightedRange.value;
  return {
    selected: inRange,
    rangeStart,
    rangeMiddle: inRange && !rangeStart && !rangeEnd,
    rangeEnd,
    preview:
      !inRange &&
      !!highlighted &&
      day.compare(highlighted.start) >= 0 &&
      day.compare(highlighted.end) <= 0,
  };
}

// Reka ignores a first press that would span a blocked day. Marking it as
// already pressed makes Reka restart the range there, as react-day-picker does.
function restartBlockedRange() {
  if (!range?.startValue.value || range.endValue.value) return;
  if (range.highlightedRange.value) return;
  if (modifiers.value.disabled || modifiers.value.unavailable) return;
  if (isSameDay(props.day, range.startValue.value)) return;
  range.lastPressedDateValue.value = props.day.copy();
}

const modifiers = computed<DatePickerDayModifiers>(() => {
  const root = range ?? calendar;
  return {
    ...selection(props.day),
    today: isSameDay(props.day, datePicker.today.value),
    outside: !isSameMonth(props.day, props.month),
    disabled: root?.isDateDisabled(props.day) ?? false,
    unavailable: root?.isDateUnavailable?.(props.day) ?? false,
  };
});
</script>

<template>
  <component
    :is="range ? RangeCalendarCell : CalendarCell"
    :date="day"
    :data-selected="modifiers.selected || undefined"
    :data-focused="focused || undefined"
    :class="
      cn(
        'nx:group/day nx:relative nx:flex nx:aspect-square nx:h-full nx:w-full nx:items-center nx:justify-center nx:p-0 nx:text-center nx:select-none nx:[&:last-child[data-selected=true]_button]:rounded-r-md',
        'nx:[&:first-child[data-selected=true]_button]:rounded-l-md',
        modifiers.rangeStart && 'nx:rounded-l-md nx:bg-primary-subtle',
        modifiers.rangeMiddle && 'nx:rounded-none nx:bg-primary-subtle',
        modifiers.rangeEnd && 'nx:rounded-r-md nx:bg-primary-subtle',
        modifiers.outside &&
          'nx:text-muted-foreground-subtle nx:aria-selected:text-muted-foreground-subtle',
        modifiers.disabled && 'nx:text-disabled-foreground',
        modifiers.unavailable && 'nx:text-muted-foreground nx:line-through',
        modifiers.preview && 'nx:bg-container-hover'
      )
    "
    @click.capture="restartBlockedRange"
    @keydown.enter.capture="restartBlockedRange"
    @keydown.space.capture="restartBlockedRange"
    @focusin="focused = true"
    @focusout="focused = false"
  >
    <DatePickerDayButton
      v-if="!modifiers.outside || datePicker.showOutsideDays.value"
      :day="day"
      :month="month"
      :modifiers="modifiers"
    />
  </component>
</template>
