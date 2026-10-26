import { CalendarDate } from '@internationalized/date';
import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ref } from 'vue';

import { Button } from '../button';
import { Card, CardContent, CardFooter } from '../card';

import { DatePicker } from '.';

// Fixed reference month keeps day-grid layout deterministic across runs.
const REFERENCE_MONTH = new CalendarDate(2025, 1, 1);
const REFERENCE_TODAY = new CalendarDate(2025, 1, 15);

// Resolve a spacing token to px from :root so cell-size assertions track the
// active spacing mode instead of hardcoding the default-mode value.
function resolveSpacingPx(canvasElement: HTMLElement, varName: string) {
  const root = canvasElement.ownerDocument.documentElement;
  return Math.round(
    parseFloat(getComputedStyle(root).getPropertyValue(varName))
  );
}

// The grid is a borderless primitive built to sit inside a Card or Popover: it
// goes transparent in `[data-slot=card-content]`, so the Card is its surface.
const inCard: Decorator = () => ({
  components: { Card, CardContent },
  template:
    '<Card class="nx:w-fit"><CardContent class="nx:p-0"><story /></CardContent></Card>',
});

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component:
          'DatePicker shows a calendar grid for picking one date, a range or several dates. Install `@internationalized/date` in your app to create its dates.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// Single-date selection — the default mode.
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { Card, CardContent, DatePicker },
    setup: () => ({
      month: new CalendarDate(2025, 1, 1),
      date: ref(new CalendarDate(2025, 1, 15)),
    }),
    template: `
      <Card class="nx:w-fit">
        <CardContent class="nx:p-0">
          <DatePicker v-model="date" :default-placeholder="month" />
        </CardContent>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const currentMonthDay = canvasElement.querySelector<HTMLButtonElement>(
      'button[data-day="2025-01-01"]'
    );
    const outsideMonthDay = canvasElement.querySelector<HTMLButtonElement>(
      'button[data-day="2024-12-29"]'
    );
    const outsideMonthCell = outsideMonthDay?.closest('td');

    await expect(currentMonthDay).toBeInTheDocument();
    await expect(outsideMonthDay).toBeInTheDocument();
    await expect(outsideMonthCell).toBeInTheDocument();
    await expect(outsideMonthDay).toHaveAttribute('data-outside', 'true');

    const currentColor = getComputedStyle(currentMonthDay!).color;
    const outsideColor = getComputedStyle(outsideMonthDay!).color;
    const outsideCellColor = getComputedStyle(outsideMonthCell!).color;

    expect(outsideColor).not.toBe(currentColor);
    expect(outsideColor).toBe(outsideCellColor);
  },
};

// Today renders an `error-background` inner circle with `error-foreground` text.
export const Today: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_MONTH, REFERENCE_TODAY }),
    template:
      '<DatePicker :default-placeholder="REFERENCE_MONTH" :today="REFERENCE_TODAY" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const today = canvas.getByText('15').closest('button');

    await expect(today).toHaveAttribute('data-today', 'true');
    await expect(today).not.toHaveAttribute('data-selected-single', 'true');
  },
};

// Large cells use the `large` preset (spacing-12, 48px under the default mode).
export const LargeCells: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_TODAY }),
    template:
      '<DatePicker cell-size="large" :default-value="REFERENCE_TODAY" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByText('15').closest('button');

    await expect(
      canvasElement.querySelector('[data-cell-size="large"]')
    ).toBeInTheDocument();
    const largeCellPx = resolveSpacingPx(canvasElement, '--nx-spacing-12');
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(
      largeCellPx
    );
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(
      largeCellPx
    );
  },
};

// Secondary content inside the day button via the `day-content` slot; the
// `xlarge` preset gives the extra row room.
export const CustomDayContent: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_TODAY }),
    template: `
      <DatePicker cell-size="xlarge" :default-value="REFERENCE_TODAY">
        <template #day-content="{ date }">
          <span>{{ date.day }}</span>
          <span class="nx:typography-body-small nx:opacity-70">\${{ date.day * 5 }}</span>
        </template>
      </DatePicker>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByText('15').closest('button');

    await expect(
      canvasElement.querySelector('[data-cell-size="xlarge"]')
    ).toBeInTheDocument();
    await expect(canvas.getByText('$75')).toBeInTheDocument();
    const xlargeCellPx = resolveSpacingPx(canvasElement, '--nx-spacing-14');
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(
      xlargeCellPx
    );
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(
      xlargeCellPx
    );
  },
};

// Range selection — the connected rail spans start → middle → end.
export const Range: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `mode="range"` to pick a start and end date, with the days between highlighted.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent, DatePicker },
    setup: () => ({
      range: ref({
        start: new CalendarDate(2025, 1, 8),
        end: new CalendarDate(2025, 1, 16),
      }),
    }),
    template: `
      <Card class="nx:w-fit">
        <CardContent class="nx:p-0">
          <DatePicker v-model="range" mode="range" />
        </CardContent>
      </Card>
    `,
  }),
};

// Range hover-preview: while a range is half-selected, hovering paints a
// tentative rail from the start to the hovered day.
export const RangeHoverPreview: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      range: ref({ start: new CalendarDate(2025, 1, 8), end: undefined }),
    }),
    template: '<DatePicker v-model="range" mode="range" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByText('11').closest('button')!);

    // Day 10 sits between the committed start (8) and the hovered day (11),
    // so its cell should carry the preview rail.
    const cell = canvas.getByText('10').closest('td');
    await waitFor(() =>
      expect(getComputedStyle(cell!).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)'
      )
    );
    await expect(cell).toHaveClass('nx:bg-container-hover');
  },
};

// A range can't span a disabled or unavailable day: the preview drops, and a
// click doesn't end the range.
export const RangeSkipsBlockedDays: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      range: ref({ start: new CalendarDate(2025, 1, 15), end: undefined }),
      bookedDay: new CalendarDate(2025, 1, 17),
    }),
    template: `
      <DatePicker
        v-model="range"
        mode="range"
        :is-date-disabled="(date) => date.day === 12"
        :is-date-unavailable="(date) => date.compare(bookedDay) === 0"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day = (label: string) => canvas.getByText(label).closest('button')!;
    const cell = (label: string) => canvas.getByText(label).closest('td');

    await userEvent.hover(day('13'));
    await waitFor(() =>
      expect(cell('13')).toHaveClass('nx:bg-container-hover')
    );

    // Day 12 is disabled, so hovering back to 10 shades nothing.
    await userEvent.hover(day('10'));
    await waitFor(() =>
      expect(cell('13')).not.toHaveClass('nx:bg-container-hover')
    );

    await userEvent.hover(day('16'));
    await waitFor(() =>
      expect(cell('16')).toHaveClass('nx:bg-container-hover')
    );

    // Day 17 is unavailable, so hovering 19 shades nothing.
    await userEvent.hover(day('19'));
    await waitFor(() =>
      expect(cell('16')).not.toHaveClass('nx:bg-container-hover')
    );
    await expect(cell('18')).not.toHaveClass('nx:bg-container-hover');

    // Clicking 19 can't end the range across day 17.
    await userEvent.click(day('19'));
    await expect(
      canvasElement.querySelector('[data-range-end="true"]')
    ).toBeNull();
  },
};

// Multiple discrete dates.
export const Multiple: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Set `mode="multiple"` to pick several separate dates.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent, DatePicker },
    setup: () => ({
      dates: ref([
        new CalendarDate(2025, 1, 6),
        new CalendarDate(2025, 1, 13),
        new CalendarDate(2025, 1, 20),
      ]),
    }),
    template: `
      <Card class="nx:w-fit">
        <CardContent class="nx:p-0">
          <DatePicker v-model="dates" mode="multiple" />
        </CardContent>
      </Card>
    `,
  }),
};

// Month / year dropdown caption instead of the static label.
export const DropdownCaption: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `captionLayout="dropdown"` to jump between months and years from dropdowns.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent, DatePicker },
    setup: () => ({ date: ref(new CalendarDate(2025, 1, 15)) }),
    template: `
      <Card class="nx:w-fit">
        <CardContent class="nx:p-0">
          <DatePicker v-model="date" caption-layout="dropdown" />
        </CardContent>
      </Card>
    `,
  }),
};

// Specific days disabled — dimmed and non-interactive.
export const DisabledDays: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Pass `isDateDisabled` so matching dates show dimmed and cannot be picked.',
      },
    },
  },
  render: () => ({
    components: { Card, CardContent, DatePicker },
    setup: () => ({
      month: new CalendarDate(2025, 1, 1),
      disabledDays: ['2025-01-10', '2025-01-11'],
    }),
    template: `
      <Card class="nx:w-fit">
        <CardContent class="nx:p-0">
          <DatePicker
            :default-placeholder="month"
            :is-date-disabled="(date) => disabledDays.includes(date.toString())"
          />
        </CardContent>
      </Card>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day10 = canvas.getByText('10').closest('button');

    await expect(day10).toBeDisabled();
    // A disabled day recolors via a semantic disabled-text token at full
    // opacity (not a fade).
    await expect(day10).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(day10!).opacity).toBe('1');
    await userEvent.click(day10!, { pointerEventsCheck: 0 });
    await expect(day10).not.toHaveAttribute('data-selected-single', 'true');
  },
};

// Unavailable (booked / blackout) days — struck through, distinct from plain
// disabled. `isDateUnavailable` styles the cell; pair it with `isDateDisabled`
// to also block focus.
export const UnavailableDays: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      REFERENCE_TODAY,
      booked: (date: CalendarDate) =>
        ['2025-01-20', '2025-01-21'].includes(date.toString()),
    }),
    template: `
      <DatePicker
        :default-value="REFERENCE_TODAY"
        :is-date-disabled="booked"
        :is-date-unavailable="booked"
      />
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cell = canvas.getByText('20').closest('td');

    await expect(cell).toBeInTheDocument();
    expect(getComputedStyle(cell!).textDecorationLine).toContain(
      'line-through'
    );
  },
};

// First day of week — Monday-first. Pass a `locale` to derive the weekday
// names per region.
export const WeekStartsMonday: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_TODAY }),
    template:
      '<DatePicker :week-starts-on="1" :default-value="REFERENCE_TODAY" />',
  }),
  play: async ({ canvasElement }) => {
    const weekdays = canvasElement.querySelectorAll('thead th');

    // Monday-first → the first weekday header is "Mo", last is "Su".
    await expect(weekdays[0]).toHaveTextContent('Mo');
    await expect(weekdays[6]).toHaveTextContent('Su');
  },
};

// Clicking a day selects it (data-selected-single flips true).
export const ClickInteraction: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_MONTH }),
    template: '<DatePicker :default-placeholder="REFERENCE_MONTH" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('15').closest('button')!);
    await expect(canvas.getByText('15').closest('button')).toHaveAttribute(
      'data-selected-single',
      'true'
    );
  },
};

// Arrow keys move the roving focus across the day grid.
export const KeyboardInteraction: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_MONTH }),
    template: '<DatePicker :default-placeholder="REFERENCE_MONTH" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('15').closest('button')!);
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByText('16').closest('button')).toHaveFocus();
  },
};

// data-slot identifies the root; each day button carries data-day.
export const WithDataAttributes: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({ REFERENCE_MONTH }),
    template: '<DatePicker :default-placeholder="REFERENCE_MONTH" />',
  }),
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="date-picker"]')
    ).toBeInTheDocument();
    const canvas = within(canvasElement);
    const day15 = canvas.getByText('15').closest('button');
    await expect(day15).toHaveAttribute('data-day');
    // Day cells + weekday headers share the typography-body-default composite.
    await expect(day15).toHaveClass('nx:typography-body-default');
    await expect(canvasElement.querySelector('thead th')).toHaveClass(
      'nx:typography-body-default'
    );
  },
};

// Accessibility: Reka labels each day with its full date and marks the picked
// day's cell `aria-selected`; the `footer` slot renders in an aria-live status
// region so the current selection is announced.
export const Accessibility: Story = {
  decorators: [inCard],
  render: () => ({
    components: { DatePicker },
    setup: () => ({
      REFERENCE_MONTH,
      date: ref<CalendarDate | undefined>(new CalendarDate(2025, 1, 15)),
      today: new CalendarDate(2025, 1, 8),
    }),
    template: `
      <DatePicker v-model="date" :today="today" :default-placeholder="REFERENCE_MONTH">
        <template #footer>{{ date ? 'Selected ' + date.toString() : 'No date selected' }}</template>
      </DatePicker>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selectedLabel =
      canvas.getByText('15').closest('button')!.getAttribute('aria-label') ??
      '';

    expect(selectedLabel).toContain('January 15, 2025');
    await expect(canvas.getByText('15').closest('td')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByText('8').closest('button')).toHaveAttribute(
      'data-today',
      'true'
    );

    const footer = canvas.getByText(/Selected/);
    await expect(footer).toHaveAttribute('aria-live', 'polite');
  },
};

// Calendar in a Card with quick-preset buttons. The grid goes transparent
// inside CardContent, so the Card supplies the surface.
export const WithPresets: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story: 'Add preset buttons in a Card footer to jump to common dates.',
      },
    },
  },
  render: () => ({
    components: { Button, Card, CardContent, CardFooter, DatePicker },
    setup: () => ({
      start: new CalendarDate(2025, 1, 15),
      date: ref(new CalendarDate(2025, 1, 15)),
      month: ref(new CalendarDate(2025, 1, 1)),
      presets: [
        { label: 'Today', days: 0 },
        { label: 'Tomorrow', days: 1 },
        { label: 'In 3 days', days: 3 },
        { label: 'In a week', days: 7 },
        { label: 'In 2 weeks', days: 14 },
      ],
    }),
    template: `
      <Card class="nx:w-fit">
        <CardContent class="nx:p-0">
          <DatePicker v-model="date" v-model:placeholder="month" fixed-weeks />
        </CardContent>
        <CardFooter class="nx:grid nx:grid-cols-2 nx:gap-2 nx:border-t-default nx:border-border-default nx:p-4 nx:[&>*:last-child]:col-span-2">
          <Button
            v-for="preset in presets"
            :key="preset.label"
            variant="outline"
            size="sm"
            @click="date = start.add({ days: preset.days }); month = date.set({ day: 1 })"
          >{{ preset.label }}</Button>
        </CardFooter>
      </Card>
    `,
  }),
};
