import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { DatePicker } from './date-picker';
import datePickerMeta, {
  CustomDayContent,
  Default,
  DisabledDays,
  LargeCells,
  RangeHoverPreview,
  RangeSkipsBlockedDays,
  UnavailableDays,
  WeekStartsMonday,
  WithDataAttributes,
} from './DatePicker.stories';

const meta: Meta<typeof DatePicker> = {
  ...datePickerMeta,
  title: 'Tests/DatePicker',
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

// Resolve a spacing token to px from :root so cell-size assertions track the
// active spacing mode instead of hardcoding the default-mode value.
function resolveSpacingPx(canvasElement: HTMLElement, varName: string) {
  const root = canvasElement.ownerDocument.documentElement;
  return Math.round(
    parseFloat(getComputedStyle(root).getPropertyValue(varName))
  );
}

export const DefaultStyle: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const currentMonthDay = canvasElement.querySelector<HTMLButtonElement>(
      'button[data-day="2025-01-01"]'
    );
    const outsideMonthDay = canvasElement.querySelector<HTMLButtonElement>(
      'button[data-day="2024-12-29"]'
    );
    const outsideMonthCell = outsideMonthDay?.closest('.rdp-day');

    await expect(outsideMonthCell).toBeInTheDocument();

    const currentColor = getComputedStyle(currentMonthDay!).color;
    const outsideColor = getComputedStyle(outsideMonthDay!).color;
    const outsideCellColor = getComputedStyle(outsideMonthCell!).color;

    expect(outsideColor).not.toBe(currentColor);
    expect(outsideColor).toBe(outsideCellColor);
  },
};

export const LargeCellsSize: Story = {
  ...LargeCells,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByText('15').closest('button');

    const largeCellPx = resolveSpacingPx(canvasElement, '--nx-spacing-12');
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(
      largeCellPx
    );
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(
      largeCellPx
    );
  },
};

export const CustomDayContentSize: Story = {
  ...CustomDayContent,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByText('15').closest('button');

    const xlargeCellPx = resolveSpacingPx(canvasElement, '--nx-spacing-14');
    expect(Math.round(selected!.getBoundingClientRect().width)).toBe(
      xlargeCellPx
    );
    expect(Math.round(selected!.getBoundingClientRect().height)).toBe(
      xlargeCellPx
    );
  },
};

export const RangeHoverPreviewStyle: Story = {
  ...RangeHoverPreview,
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

export const RangeSkipsBlockedDaysStyle: Story = {
  ...RangeSkipsBlockedDays,
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
  },
};

export const DisabledDaysStyle: Story = {
  ...DisabledDays,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day10 = canvas.getByText('10').closest('button');

    // A disabled day recolors via a semantic disabled-text token at full
    // opacity (not a fade).
    await expect(day10).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(day10!).opacity).toBe('1');
  },
};

export const UnavailableDaysStyle: Story = {
  ...UnavailableDays,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const cell = canvas.getByText('20').closest('td');

    expect(getComputedStyle(cell!).textDecorationLine).toContain(
      'line-through'
    );
  },
};

export const WeekStartsMondayOrder: Story = {
  ...WeekStartsMonday,
  play: async ({ canvasElement }) => {
    const weekdays = canvasElement.querySelectorAll('.rdp-weekday');

    // Monday-first → the first weekday header is "Mo", last is "Su".
    await expect(weekdays[0]).toHaveTextContent('Mo');
    await expect(weekdays[6]).toHaveTextContent('Su');
  },
};

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const day15 = canvas.getByText('15').closest('button');

    // #498: day cells + weekday headers use the typography-body-default composite
    // (migrated from the raw named text-size utility); both share the same 14px/400 type.
    await expect(day15).toHaveClass('nx:typography-body-default');
    await expect(canvasElement.querySelector('.rdp-weekday')).toHaveClass(
      'nx:typography-body-default'
    );
  },
};
