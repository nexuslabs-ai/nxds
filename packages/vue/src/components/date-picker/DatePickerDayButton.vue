<script setup lang="ts">
import {
  CalendarCellTrigger,
  type CalendarCellTriggerProps,
  RangeCalendarCellTrigger,
} from 'reka-ui';
import { computed, type FunctionalComponent, type HTMLAttributes } from 'vue';

import { cn } from '../../lib/utils';
import { buttonVariants } from '../button';

import { type DatePickerDayModifiers, injectDatePicker } from '.';

export interface DatePickerDayButtonProps extends Omit<
  CalendarCellTriggerProps,
  'as' | 'asChild'
> {
  /** The day's state, which the button shows through its `data-*` attributes. */
  modifiers: DatePickerDayModifiers;
  class?: HTMLAttributes['class'];
}

const props = defineProps<DatePickerDayButtonProps>();

const datePicker = injectDatePicker();

const isSelected = computed(
  () =>
    props.modifiers.selected ||
    props.modifiers.rangeStart ||
    props.modifiers.rangeMiddle ||
    props.modifiers.rangeEnd
);
const isToday = computed(
  () => props.modifiers.today && !isSelected.value && !props.modifiers.disabled
);
const isOutside = computed(
  () =>
    props.modifiers.outside &&
    !isSelected.value &&
    !isToday.value &&
    !props.modifiers.disabled
);

const DayContent: FunctionalComponent = () =>
  datePicker.dayContent()?.({ date: props.day, modifiers: props.modifiers });
</script>

<template>
  <!-- These attributes win over Reka's own, which mark today by the clock and not the `today` prop. -->
  <component
    :is="
      datePicker.mode.value === 'range'
        ? RangeCalendarCellTrigger
        : CalendarCellTrigger
    "
    :day="day"
    :month="month"
    as="button"
    type="button"
    data-slot="button"
    data-variant="ghost"
    data-size="icon"
    data-icon-only="true"
    :disabled="modifiers.disabled || undefined"
    :data-day="day.toString()"
    :data-selected-single="
      modifiers.selected &&
      !modifiers.rangeStart &&
      !modifiers.rangeEnd &&
      !modifiers.rangeMiddle
    "
    :data-range-start="modifiers.rangeStart"
    :data-range-end="modifiers.rangeEnd"
    :data-range-middle="modifiers.rangeMiddle"
    :data-today="isToday"
    :data-outside="isOutside || undefined"
    :class="
      cn(
        buttonVariants({ variant: 'ghost', size: 'icon' }),
        'nx:flex nx:aspect-square nx:size-(--cell-size) nx:min-w-(--cell-size) nx:typography-body-default',
        'nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        isOutside && 'nx:text-muted-foreground-subtle',
        'nx:group-data-[focused=true]/day:relative nx:group-data-[focused=true]/day:z-10 nx:group-data-[focused=true]/day:outline-2 nx:group-data-[focused=true]/day:outline-focus-default',
        'nx:data-[today=true]:relative nx:data-[today=true]:bg-transparent nx:data-[today=true]:typography-label-default nx:data-[today=true]:text-error-foreground nx:data-[today=true]:hover:bg-transparent nx:data-[today=true]:hover:text-error-foreground',
        'nx:data-[today=true]:before:absolute nx:data-[today=true]:before:top-1/2 nx:data-[today=true]:before:left-1/2 nx:data-[today=true]:before:size-(--today-marker-size) nx:data-[today=true]:before:-translate-x-1/2 nx:data-[today=true]:before:-translate-y-1/2 nx:data-[today=true]:before:rounded-full nx:data-[today=true]:before:bg-error-background nx:data-[today=true]:hover:before:bg-error-background-hover',
        `nx:data-[today=true]:before:content-['']`,
        'nx:data-[selected-single=true]:bg-primary-background nx:data-[selected-single=true]:text-primary-foreground',
        'nx:data-[range-start=true]:rounded-md nx:data-[range-start=true]:bg-primary-background nx:data-[range-start=true]:text-primary-foreground',
        'nx:data-[range-end=true]:rounded-md nx:data-[range-end=true]:bg-primary-background nx:data-[range-end=true]:text-primary-foreground',
        'nx:data-[range-middle=true]:rounded-none nx:data-[range-middle=true]:bg-primary-subtle nx:data-[range-middle=true]:text-primary-subtle-foreground',
        props.class
      )
    "
  >
    <span
      data-slot="date-picker-day-content"
      class="nx:relative nx:z-10 nx:flex nx:flex-col nx:items-center nx:justify-center nx:gap-1"
    >
      <DayContent v-if="datePicker.dayContent()" />
      <template v-else>{{ day.day }}</template>
    </span>
  </component>
</template>
