'use client';

import * as React from 'react';
import {
  type Chevron,
  type DateRange,
  type Day,
  type DayButton,
  DayPicker,
  getDefaultClassNames,
  type Matcher,
  rangeContainsModifiers,
  useDayPicker,
  type WeekNumber,
} from 'react-day-picker';

import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from '../../lib/icons';
import { cn } from '../../lib/utils';
import { Button, buttonVariants } from '../button/button';

type DatePickerCellSize = 'default' | 'large' | 'xlarge';

type DatePickerDayButtonProps = React.ComponentProps<typeof DayButton>;

type DatePickerDayContentProps = {
  date: Date;
  day: DatePickerDayButtonProps['day'];
  modifiers: DatePickerDayButtonProps['modifiers'];
};

type DatePickerDayContent = (
  props: DatePickerDayContentProps
) => React.ReactNode;

const cellSizeClassNames: Record<DatePickerCellSize, string> = {
  default:
    'nx:[--cell-size:var(--nx-spacing-8)] nx:[--today-marker-size:var(--nx-spacing-6)]',
  large:
    'nx:[--cell-size:var(--nx-spacing-12)] nx:[--today-marker-size:var(--nx-spacing-10)]',
  xlarge:
    'nx:[--cell-size:var(--nx-spacing-14)] nx:[--today-marker-size:var(--nx-spacing-12)]',
};

const DatePickerDayContentContext =
  React.createContext<DatePickerDayContent | null>(null);

// The day last hovered or focused, which a half-picked range previews up to.
const DatePickerPreviewContext = React.createContext<Date | undefined>(
  undefined
);

// react-day-picker's default class names are static — compute once at module load.
const defaultClassNames = getDefaultClassNames();

// Prop-independent slot class names — merged once at module load, not per render.
// `satisfies` keeps the slot-key typo-checking the inline `classNames` literal
// had: a misspelled key would otherwise spread in silently and ship its default.
// The four prop-dependent slots (button_previous/next, caption_label, day) stay
// inline in the component because they read buttonVariant / captionLayout /
// showWeekNumber.
const staticDayPickerClassNames = {
  root: cn('nx:w-fit', defaultClassNames.root),
  // Row layout so numberOfMonths > 1 sits side by side; a single month
  // is unaffected. The absolute nav positions against this `relative`.
  months: cn(
    'nx:relative nx:flex nx:flex-row nx:gap-4',
    defaultClassNames.months
  ),
  month: cn('nx:flex nx:w-full nx:flex-col nx:gap-4', defaultClassNames.month),
  nav: cn(
    'nx:absolute nx:inset-x-0 nx:top-0 nx:flex nx:w-full nx:items-center nx:justify-between nx:gap-1',
    defaultClassNames.nav
  ),
  month_caption: cn(
    'nx:flex nx:h-(--cell-size) nx:w-full nx:items-center nx:justify-center nx:px-(--cell-size)',
    defaultClassNames.month_caption
  ),
  dropdowns: cn(
    'nx:flex nx:h-(--cell-size) nx:w-full nx:items-center nx:justify-center nx:gap-1.5 nx:typography-label-default',
    defaultClassNames.dropdowns
  ),
  dropdown_root: cn(
    'nx:relative nx:rounded-md nx:border-default nx:border-border-default nx:shadow-xs nx:has-focus:border-border-focus',
    defaultClassNames.dropdown_root
  ),
  dropdown: cn(
    'nx:absolute nx:inset-0 nx:bg-popover nx:opacity-0',
    defaultClassNames.dropdown
  ),
  table: 'nx:w-full nx:border-collapse',
  weekdays: cn('nx:flex', defaultClassNames.weekdays),
  weekday: cn(
    'nx:flex-1 nx:rounded-md nx:typography-body-default nx:text-muted-foreground-subtle nx:select-none',
    defaultClassNames.weekday
  ),
  week: cn('nx:mt-2 nx:flex nx:w-full', defaultClassNames.week),
  week_number_header: cn(
    'nx:w-(--cell-size) nx:select-none',
    defaultClassNames.week_number_header
  ),
  week_number: cn(
    'nx:typography-label-small nx:text-muted-foreground-subtle nx:select-none',
    defaultClassNames.week_number
  ),
  range_start: cn(
    'nx:rounded-l-md nx:bg-primary-subtle',
    defaultClassNames.range_start
  ),
  range_middle: cn(
    'nx:rounded-none nx:bg-primary-subtle',
    defaultClassNames.range_middle
  ),
  range_end: cn(
    'nx:rounded-r-md nx:bg-primary-subtle',
    defaultClassNames.range_end
  ),
  today: defaultClassNames.today,
  outside: cn(
    'nx:text-muted-foreground-subtle nx:aria-selected:text-muted-foreground-subtle',
    defaultClassNames.outside
  ),
  disabled: cn('nx:text-disabled-foreground', defaultClassNames.disabled),
  hidden: cn('nx:invisible', defaultClassNames.hidden),
} satisfies NonNullable<React.ComponentProps<typeof DayPicker>['classNames']>;

/**
 * DatePickerProps
 *
 * Props for the DatePicker component. Accepts every `react-day-picker` prop,
 * plus the props listed here.
 */
type DatePickerProps = React.ComponentProps<typeof DayPicker> & {
  /**
   * Button variant for the previous and next month arrows.
   */
  buttonVariant?: React.ComponentProps<typeof Button>['variant'];
  /**
   * Day-cell size: `default` is 32px, `large` 48px, `xlarge` 56px. For another
   * size, set `--cell-size` through `className`.
   */
  cellSize?: DatePickerCellSize;
  /**
   * Custom content inside each day button. The button keeps its keyboard
   * behavior.
   *
   * @thirdPartyShape react-day-picker owns the per-day render loop, so
   * per-day content can't be a children slot.
   */
  renderDayContent?: (props: DatePickerDayContentProps) => React.ReactNode;
};

/**
 * A calendar grid for picking one date, a range or several dates. Install
 * `react-day-picker` in your app first.
 */
function DatePicker({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  cellSize = 'default',
  renderDayContent,
  formatters,
  modifiersClassNames,
  components,
  onDayMouseEnter,
  onDayFocus,
  ...props
}: DatePickerProps) {
  const [previewTo, setPreviewTo] = React.useState<Date>();

  function handleDayMouseEnter(
    ...[date, modifiers, event]: Parameters<NonNullable<typeof onDayMouseEnter>>
  ) {
    if (!modifiers.disabled && !modifiers.unavailable) setPreviewTo(date);
    onDayMouseEnter?.(date, modifiers, event);
  }

  function handleDayFocus(
    ...[date, modifiers, event]: Parameters<NonNullable<typeof onDayFocus>>
  ) {
    if (!modifiers.disabled && !modifiers.unavailable) setPreviewTo(date);
    onDayFocus?.(date, modifiers, event);
  }

  return (
    <DatePickerDayContentContext.Provider value={renderDayContent ?? null}>
      <DatePickerPreviewContext.Provider value={previewTo}>
        <DayPicker
          data-slot="date-picker"
          data-cell-size={cellSize}
          showOutsideDays={showOutsideDays}
          className={cn(
            'nx:group/date-picker nx:bg-background nx:p-3',
            cellSizeClassNames[cellSize],
            'nx:in-data-[slot=card-content]:bg-transparent nx:in-data-[slot=popover-content]:bg-transparent',
            className
          )}
          captionLayout={captionLayout}
          formatters={{
            formatMonthDropdown: (date) =>
              date.toLocaleString('default', { month: 'short' }),
            ...formatters,
          }}
          // `unavailable` (pair with `disabled`) strikes booked or blackout days.
          modifiersClassNames={{
            unavailable: 'nx:text-muted-foreground nx:line-through',
            ...modifiersClassNames,
          }}
          onDayMouseEnter={handleDayMouseEnter}
          onDayFocus={handleDayFocus}
          classNames={{
            ...staticDayPickerClassNames,
            button_previous: cn(
              buttonVariants({ variant: buttonVariant, size: 'icon' }),
              'nx:size-(--cell-size) nx:p-0 nx:select-none nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
              defaultClassNames.button_previous
            ),
            button_next: cn(
              buttonVariants({ variant: buttonVariant, size: 'icon' }),
              'nx:size-(--cell-size) nx:p-0 nx:select-none nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
              defaultClassNames.button_next
            ),
            caption_label: cn(
              'nx:typography-label-default nx:select-none',
              captionLayout !== 'label' &&
                'nx:flex nx:h-8 nx:items-center nx:gap-1 nx:rounded-md nx:pr-1 nx:pl-2 nx:[&>svg]:size-3.5 nx:[&>svg]:text-muted-foreground',
              defaultClassNames.caption_label
            ),
            day: cn(
              'nx:group/day nx:relative nx:flex nx:aspect-square nx:h-full nx:w-full nx:items-center nx:justify-center nx:p-0 nx:text-center nx:select-none nx:[&:last-child[data-selected=true]_button]:rounded-r-md',
              props.showWeekNumber
                ? 'nx:[&:nth-child(2)[data-selected=true]_button]:rounded-l-md'
                : 'nx:[&:first-child[data-selected=true]_button]:rounded-l-md',
              defaultClassNames.day
            ),
            ...classNames,
          }}
          components={{
            Chevron: DatePickerChevron,
            Day: DatePickerDay,
            DayButton: DatePickerDayButton,
            WeekNumber: DatePickerWeekNumber,
            ...components,
          }}
          {...props}
        />
      </DatePickerPreviewContext.Provider>
    </DatePickerDayContentContext.Provider>
  );
}

function DatePickerChevron({
  className,
  orientation,
  ...props
}: React.ComponentProps<typeof Chevron>) {
  if (orientation === 'left') {
    return (
      <IconChevronLeft
        className={cn('nx:size-4 nx:text-muted-foreground', className)}
        {...props}
      />
    );
  }

  if (orientation === 'right') {
    return (
      <IconChevronRight
        className={cn('nx:size-4 nx:text-muted-foreground', className)}
        {...props}
      />
    );
  }

  return <IconChevronDown className={cn('nx:size-4', className)} {...props} />;
}

// react-day-picker passes `scope="row"` / `role="rowheader"`, valid only on a
// <th> — match its default element (and drop the non-DOM `week` prop) so the
// cell stays accessible.
function DatePickerWeekNumber({
  week,
  children,
  ...props
}: React.ComponentProps<typeof WeekNumber>) {
  void week;
  return (
    <th {...props}>
      <div className="nx:flex nx:size-(--cell-size) nx:items-center nx:justify-center nx:text-center">
        {children}
      </div>
    </th>
  );
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/**
 * Whether `date` sits between a half-picked range's start and `previewTo`, the
 * start aside. A span that crosses a `blocked` day has no preview.
 */
function isRangePreview(
  date: Date,
  range: DateRange | undefined,
  previewTo: Date | undefined,
  blocked: Matcher[]
) {
  if (!range?.from || !previewTo) return false;
  const from = startOfDay(range.from);
  if (range.to && startOfDay(range.to) !== from) return false;

  const day = startOfDay(date);
  const to = startOfDay(previewTo);
  if (day === from) return false;
  if (day < Math.min(from, to) || day > Math.max(from, to)) return false;
  return !rangeContainsModifiers({ from: range.from, to: previewTo }, blocked);
}

/**
 * The cell for each day. While a range is half-picked, it shades the days up
 * to the hovered or focused day.
 */
function DatePickerDay({
  day,
  modifiers,
  className,
  ...props
}: React.ComponentProps<typeof Day>) {
  void modifiers;
  const { dayPickerProps, selected } = useDayPicker<{ mode: 'range' }>();
  const previewTo = React.useContext(DatePickerPreviewContext);
  const blocked = [
    dayPickerProps.disabled ?? [],
    dayPickerProps.modifiers?.unavailable ?? [],
  ].flat();
  const preview =
    dayPickerProps.mode === 'range' &&
    isRangePreview(day.date, selected, previewTo, blocked);

  return (
    <td
      className={cn(className, preview && 'nx:bg-container-hover')}
      {...props}
    />
  );
}

/**
 * The button for each day. Exposes selected and range state as `data-*`
 * attributes.
 */
function DatePickerDayButton({
  className,
  day,
  modifiers,
  children,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const renderDayContent = React.useContext(DatePickerDayContentContext);

  const ref = React.useRef<HTMLButtonElement>(null);
  // Sync DOM focus to react-day-picker's roving-focus model (external system).
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isSelected =
    modifiers.selected ||
    modifiers.range_start ||
    modifiers.range_middle ||
    modifiers.range_end;
  const isToday = modifiers.today && !isSelected && !modifiers.disabled;
  const isOutside =
    modifiers.outside && !isSelected && !isToday && !modifiers.disabled;
  const content = renderDayContent
    ? renderDayContent({ date: day.date, day, modifiers })
    : children;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.isoDate}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      data-today={isToday}
      data-outside={isOutside || undefined}
      className={cn(
        'nx:flex nx:aspect-square nx:size-(--cell-size) nx:min-w-(--cell-size) nx:typography-body-default',
        'nx:disabled:text-disabled-foreground nx:aria-disabled:text-disabled-foreground',
        isOutside && 'nx:text-muted-foreground-subtle',
        // Keyboard-focus ring on the focused day (modality-independent — paints above neighbours).
        'nx:group-data-[focused=true]/day:relative nx:group-data-[focused=true]/day:z-10 nx:group-data-[focused=true]/day:outline-2 nx:group-data-[focused=true]/day:outline-focus-default',
        // Today → inner error circle while keeping the button target at cell size.
        'nx:data-[today=true]:relative nx:data-[today=true]:bg-transparent nx:data-[today=true]:typography-label-default nx:data-[today=true]:text-error-foreground nx:data-[today=true]:hover:bg-transparent nx:data-[today=true]:hover:text-error-foreground',
        'nx:data-[today=true]:before:absolute nx:data-[today=true]:before:top-1/2 nx:data-[today=true]:before:left-1/2 nx:data-[today=true]:before:size-(--today-marker-size) nx:data-[today=true]:before:-translate-x-1/2 nx:data-[today=true]:before:-translate-y-1/2 nx:data-[today=true]:before:rounded-full nx:data-[today=true]:before:bg-error-background nx:data-[today=true]:hover:before:bg-error-background-hover',
        "nx:data-[today=true]:before:content-['']",
        // Selected single + range endpoints → solid primary fill.
        'nx:data-[selected-single=true]:bg-primary-background nx:data-[selected-single=true]:text-primary-foreground',
        'nx:data-[range-start=true]:rounded-md nx:data-[range-start=true]:bg-primary-background nx:data-[range-start=true]:text-primary-foreground',
        'nx:data-[range-end=true]:rounded-md nx:data-[range-end=true]:bg-primary-background nx:data-[range-end=true]:text-primary-foreground',
        // Range middle → subtle primary fill (continuous with the cell rail).
        'nx:data-[range-middle=true]:rounded-none nx:data-[range-middle=true]:bg-primary-subtle nx:data-[range-middle=true]:text-primary-subtle-foreground',
        defaultClassNames.day_button,
        className
      )}
      {...props}
    >
      <span
        data-slot="date-picker-day-content"
        className="nx:relative nx:z-10 nx:flex nx:flex-col nx:items-center nx:justify-center nx:gap-1"
      >
        {content}
      </span>
    </Button>
  );
}

export {
  DatePicker,
  type DatePickerCellSize,
  DatePickerDayButton,
  type DatePickerDayContent,
  type DatePickerDayContentProps,
  type DatePickerProps,
};
