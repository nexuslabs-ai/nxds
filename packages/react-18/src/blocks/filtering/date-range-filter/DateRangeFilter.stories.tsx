import * as React from 'react';

import { CalendarBlankIcon } from '@phosphor-icons/react/ssr';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  dispatchStoryEvent,
  expectEditorClosed,
  expectFocus,
  expectMenuClosed,
  ParentForm,
  useStoryEvent,
} from '../filter.story-utils';

import { type DateRangeCondition, DateRangeFilter } from './date-range-filter';
import { DateRangeFilterExample } from './date-range-filter-example';

const initial: DateRangeCondition = {
  operator: 'between',
  from: '2026-09-01',
  to: '2026-09-10',
};
const replacement: DateRangeCondition = {
  operator: 'between',
  from: '2026-09-02',
  to: '2026-09-03',
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: DateRangeCondition | null;
  disabled?: boolean;
  onChange?: (value: DateRangeCondition | null) => void;
}) {
  const [value, setValue] = React.useState<DateRangeCondition | null>(
    initialValue
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: DateRangeCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="DateRangeFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <DateRangeFilter
        label="Created"
        icon={<CalendarBlankIcon aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
        today={new Date(2026, 8, 27)}
      />
      <output
        aria-label="Applied condition"
        className="nx:max-w-full nx:break-all nx:typography-body-small nx:text-muted-foreground"
      >
        {JSON.stringify(value)}
      </output>
    </section>
  );
}
const meta = {
  component: Preview,
  args: { onChange: fn() },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { disable: true },
    docs: {
      description: {
        component:
          "DateRangeFilter filters by a range of calendar days, applied when users press Apply. Use it for created, updated or due dates. Presets cover common ranges, and the calendar covers the rest. If your Next.js app uses Cache Components, render DateRangeFilter inside `<Suspense>` so it can read today's date.",
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  render: () => <DateRangeFilterExample />,
};
export const NotApplied: Story = {
  render: () => <Preview initialValue={null} />,
};
export const EmptyOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Created operator' })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Change Created operator' })
      ).toHaveFocus()
    );
  },
};
export const MalformedValue: Story = {
  render: () => (
    <Preview
      initialValue={{ operator: 'between', from: '2026-02-31', to: 'soon' }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Edit Created: Choose…',
    });
    await expect(trigger).toHaveTextContent('Choose…');
    await userEvent.click(trigger);
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
  },
};
export const Disabled: Story = {
  render: () => <Preview disabled />,
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button'))
      await expect(button).toBeDisabled();
  },
};
export const ApplyAndCancel: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const before = canvas.getByLabelText('Applied condition').textContent ?? '';
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Last 7 days' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(page.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(
      canvas.getByLabelText('Applied condition')
    ).not.toHaveTextContent(before);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Created filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add created filter' })
      ).toHaveFocus()
    );
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'null'
    );
  },
};
export const NarrowContainer: Story = {
  render: () => (
    <div className="nx:w-64 nx:max-w-full">
      <Preview />
    </div>
  ),
};
const lastSevenDays = {
  operator: 'between',
  from: '2026-09-21',
  to: '2026-09-27',
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add created filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by created' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.click(editor.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith(lastSevenDays);
    await expectEditorClosed(canvasElement, 'Filter by created');
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Created operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is not empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNotEmpty',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const PendingOperatorApplies: Story = {
  render: (args) => (
    <Preview initialValue={{ operator: 'isEmpty' }} onChange={args.onChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Created operator',
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by created' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(editor.getByRole('button', { name: 'Last 7 days' }));
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith(lastSevenDays);
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: /^Edit Created:/ });
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by created');
    await expect(
      canvas.getByRole('button', {
        name: `Edit Created: ${new Date(2026, 8, 2).toLocaleDateString()} – ${new Date(2026, 8, 3).toLocaleDateString()}`,
      })
    ).toBeVisible();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const DisabledWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by created');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: /^Edit Created:/ })
      ).toBeEnabled()
    );
    await expect(
      page.queryByRole('dialog', { name: 'Filter by created' })
    ).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const InsideParentForm: Story = {
  render: (args) => (
    <ParentForm>
      <Preview onChange={args.onChange} />
    </ParentForm>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Edit Created:/ })
    );
    await userEvent.click(
      await page.findByRole('button', { name: 'Last 7 days' })
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith(lastSevenDays);
    await expect(canvas.getByLabelText('Parent submissions')).toHaveTextContent(
      '0'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Submit search' })
    );
    await expect(canvas.getByLabelText('Parent submissions')).toHaveTextContent(
      '1'
    );
  },
};
