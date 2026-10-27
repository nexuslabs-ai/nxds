import type { DateValue } from '@internationalized/date';
import {
  type ComputedRef,
  inject,
  type InjectionKey,
  type Ref,
  type VNode,
} from 'vue';

export { default as DatePicker, type DatePickerProps } from './DatePicker.vue';
export {
  default as DatePickerDayButton,
  type DatePickerDayButtonProps,
} from './DatePickerDayButton.vue';

export type DatePickerCellSize = 'default' | 'large' | 'xlarge';

/** A day's state, as each day button and the `day-content` slot see it. */
export interface DatePickerDayModifiers {
  selected: boolean;
  rangeStart: boolean;
  rangeMiddle: boolean;
  rangeEnd: boolean;
  /** Between the range start and the hovered day while a range is half-picked. */
  preview: boolean;
  today: boolean;
  outside: boolean;
  disabled: boolean;
  unavailable: boolean;
}

export interface DatePickerDayContentProps {
  date: DateValue;
  modifiers: DatePickerDayModifiers;
}

export const DatePickerKey: InjectionKey<{
  mode: Ref<'single' | 'multiple' | 'range'>;
  today: ComputedRef<DateValue>;
  showOutsideDays: Ref<boolean>;
  captionLayout: Ref<'label' | 'dropdown'>;
  /** The `day-content` slot. Call it while rendering. */
  dayContent: () => ((props: DatePickerDayContentProps) => VNode[]) | undefined;
}> = Symbol('date-picker');

/** The options the DatePicker provides to its days and captions. */
export function injectDatePicker() {
  const datePicker = inject(DatePickerKey);
  if (!datePicker) {
    throw new Error('DatePicker parts must be used within a <DatePicker />');
  }
  return datePicker;
}
