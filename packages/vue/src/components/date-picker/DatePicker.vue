<script setup lang="ts">
import {
  type DateValue,
  endOfYear,
  getLocalTimeZone,
  startOfYear,
  today as todayIn,
} from '@internationalized/date';
import { reactiveOmit } from '@vueuse/core';
import {
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
  type CalendarRootProps,
  type DateRange,
  RangeCalendarGrid,
  RangeCalendarGridBody,
  RangeCalendarGridHead,
  RangeCalendarGridRow,
  RangeCalendarHeadCell,
  RangeCalendarNext,
  RangeCalendarPrev,
  RangeCalendarRoot,
  useForwardPropsEmits,
} from 'reka-ui';
import { computed, type HTMLAttributes, provide, toRef, type VNode } from 'vue';

import { IconChevronLeft, IconChevronRight } from '../../lib/icons';
import { cn } from '../../lib/utils';
import { type ButtonVariants, buttonVariants } from '../button';

import DatePickerCaption from './DatePickerCaption.vue';
import DatePickerCell from './DatePickerCell.vue';

import {
  type DatePickerCellSize,
  type DatePickerDayContentProps,
  DatePickerKey,
} from '.';

export interface DatePickerProps extends Omit<
  CalendarRootProps,
  'modelValue' | 'defaultValue' | 'multiple' | 'weekdayFormat'
> {
  /** Picks one date, several dates, or a start and end date. */
  mode?: 'single' | 'multiple' | 'range';
  /** The picked date, dates or range, by mode. Bind it with `v-model`. */
  modelValue?: DateValue | DateValue[] | DateRange | null;
  /** The starting date, dates or range without `v-model`. */
  defaultValue?: DateValue | DateValue[] | DateRange;
  /** Static month label or month and year dropdowns. */
  captionLayout?: 'label' | 'dropdown';
  /** Shows days from the previous and next months. */
  showOutsideDays?: boolean;
  /** The date marked as today. Defaults to the current date. */
  today?: DateValue;
  /**
   * Button variant for the previous and next month arrows.
   */
  buttonVariant?: ButtonVariants['variant'];
  /**
   * Day-cell size: `default` is 32px, `large` 48px, `xlarge` 56px. For another
   * size, set `--cell-size` through `className`.
   */
  cellSize?: DatePickerCellSize;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<DatePickerProps>(), {
  mode: 'single',
  captionLayout: 'label',
  showOutsideDays: true,
  buttonVariant: 'ghost',
  cellSize: 'default',
});
const emits = defineEmits<{
  'update:modelValue': [value: DateValue | DateValue[] | DateRange | undefined];
  'update:placeholder': [date: DateValue];
}>();
const slots = defineSlots<{
  /**
   * Custom content inside each day button. The button keeps its keyboard
   * behavior.
   */
  'day-content'?: (props: DatePickerDayContentProps) => VNode[];
  /** Content under the grid that screen readers announce, such as the picked date. */
  footer?: () => VNode[];
}>();

const delegated = reactiveOmit(
  props,
  'class',
  'mode',
  'captionLayout',
  'showOutsideDays',
  'today',
  'buttonVariant',
  'cellSize'
);
const forwarded = useForwardPropsEmits(delegated, emits);
// `mode` picks the root and the value shape together, so each root gets its own
// shape; the type system can't see that across the two roots.
const rootProps = computed(() => forwarded.value as Record<string, unknown>);

const today = computed(() => props.today ?? todayIn(getLocalTimeZone()));

// The year dropdown runs from a century back to the end of this year, so
// navigation stops there too unless the app sets its own bounds.
const minValue = computed(
  () =>
    props.minValue ??
    (props.captionLayout === 'dropdown'
      ? startOfYear(today.value.subtract({ years: 100 }))
      : undefined)
);
const maxValue = computed(
  () =>
    props.maxValue ??
    (props.captionLayout === 'dropdown' ? endOfYear(today.value) : undefined)
);

const cellSizeClassNames: Record<DatePickerCellSize, string> = {
  default:
    'nx:[--cell-size:var(--nx-spacing-8)] nx:[--today-marker-size:var(--nx-spacing-6)]',
  large:
    'nx:[--cell-size:var(--nx-spacing-12)] nx:[--today-marker-size:var(--nx-spacing-10)]',
  xlarge:
    'nx:[--cell-size:var(--nx-spacing-14)] nx:[--today-marker-size:var(--nx-spacing-12)]',
};

const calendarParts = {
  Root: CalendarRoot,
  Prev: CalendarPrev,
  Next: CalendarNext,
  Grid: CalendarGrid,
  GridHead: CalendarGridHead,
  GridBody: CalendarGridBody,
  GridRow: CalendarGridRow,
  HeadCell: CalendarHeadCell,
};
const rangeParts = {
  Root: RangeCalendarRoot,
  Prev: RangeCalendarPrev,
  Next: RangeCalendarNext,
  Grid: RangeCalendarGrid,
  GridHead: RangeCalendarGridHead,
  GridBody: RangeCalendarGridBody,
  GridRow: RangeCalendarGridRow,
  HeadCell: RangeCalendarHeadCell,
};
const parts = computed(() =>
  props.mode === 'range' ? rangeParts : calendarParts
);

provide(DatePickerKey, {
  mode: toRef(props, 'mode'),
  today,
  showOutsideDays: toRef(props, 'showOutsideDays'),
  captionLayout: toRef(props, 'captionLayout'),
  dayContent: () => slots['day-content'],
});

const navButtonClass = computed(() =>
  cn(
    buttonVariants({ variant: props.buttonVariant, iconOnly: true }),
    'nx:size-(--cell-size) nx:select-none nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground'
  )
);
</script>

<template>
  <component
    :is="parts.Root"
    v-slot="{ grid, weekDays }"
    v-bind="rootProps"
    :min-value="minValue"
    :max-value="maxValue"
    :multiple="mode === 'multiple' ? true : undefined"
    weekday-format="short"
    data-slot="date-picker"
    :data-mode="mode"
    :data-cell-size="cellSize"
    :class="
      cn(
        'nx:w-fit',
        'nx:group/date-picker nx:bg-background nx:p-3',
        cellSizeClassNames[cellSize],
        'nx:in-data-[slot=card-content]:bg-transparent nx:in-data-[slot=popover-content]:bg-transparent',
        props.class
      )
    "
  >
    <div class="nx:relative nx:flex nx:flex-row nx:gap-4">
      <nav
        aria-label="Navigation bar"
        class="nx:absolute nx:inset-x-0 nx:top-0 nx:flex nx:w-full nx:items-center nx:justify-between nx:gap-1"
      >
        <component
          :is="parts.Prev"
          aria-label="Go to the Previous Month"
          :class="navButtonClass"
        >
          <IconChevronLeft
            class="nx:size-icon-glyph-default nx:text-muted-foreground"
          />
        </component>
        <component
          :is="parts.Next"
          aria-label="Go to the Next Month"
          :class="navButtonClass"
        >
          <IconChevronRight
            class="nx:size-icon-glyph-default nx:text-muted-foreground"
          />
        </component>
      </nav>
      <div
        v-for="month in grid"
        :key="month.value.toString()"
        class="nx:flex nx:w-full nx:flex-col nx:gap-4"
      >
        <DatePickerCaption :month="month.value" />
        <component :is="parts.Grid" class="nx:w-full nx:border-collapse">
          <component :is="parts.GridHead">
            <component :is="parts.GridRow" class="nx:flex">
              <component
                :is="parts.HeadCell"
                v-for="day in weekDays"
                :key="day"
                class="nx:flex-1 nx:rounded-md nx:typography-body-default nx:text-muted-foreground-subtle nx:select-none"
              >
                {{ day.slice(0, 2) }}
              </component>
            </component>
          </component>
          <component :is="parts.GridBody">
            <component
              :is="parts.GridRow"
              v-for="(week, index) in month.rows"
              :key="index"
              class="nx:mt-2 nx:flex nx:w-full"
            >
              <DatePickerCell
                v-for="day in week"
                :key="day.toString()"
                :day="day"
                :month="month.value"
              />
            </component>
          </component>
        </component>
      </div>
    </div>
    <div v-if="slots.footer" role="status" aria-live="polite">
      <slot name="footer" />
    </div>
  </component>
</template>
