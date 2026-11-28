import * as React from 'react';

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

import {
  type NumberRangeCondition,
  NumberRangeFilter,
} from './number-range-filter';
import { NumberRangeFilterExample } from './number-range-filter-example';

const replacement: NumberRangeCondition = {
  operator: 'between',
  min: 1,
  max: 2,
};
function Preview({
  initialValue = { operator: 'between', min: 100, max: 500 },
  disabled = false,
  lowerBound = 0,
  onChange,
}: {
  initialValue?: NumberRangeCondition | null;
  disabled?: boolean;
  lowerBound?: number;
  onChange?: (value: NumberRangeCondition | null) => void;
}) {
  const [value, setValue] = React.useState<NumberRangeCondition | null>(
    initialValue
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: NumberRangeCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <div className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4">
      <NumberRangeFilter
        label="Size"
        value={value}
        onChange={change}
        disabled={isDisabled}
        unit="KB"
        lowerBound={lowerBound}
      />
      <p
        role="status"
        className="nx:typography-body-small nx:text-muted-foreground"
      >
        {value
          ? 'A filter is applied. Edit a segment or remove it with ×.'
          : 'No filter applied. Add a condition to begin.'}
      </p>
    </div>
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
          'NumberRangeFilter filters by a number between a minimum and a maximum. Use it when both ends matter, such as a price band. For a single threshold, use NumberComparisonFilter.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  render: () => <NumberRangeFilterExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Size filter' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add size filter' })
    ).toHaveFocus();
  },
};
export const NotApplied: Story = {
  render: () => <Preview initialValue={null} />,
};
export const EmptyOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
};
export const Disabled: Story = {
  render: () => <Preview disabled />,
  play: async ({ canvasElement }) => {
    for (const button of within(canvasElement).getAllByRole('button'))
      await expect(button).toBeDisabled();
  },
};
export const PendingOperator: Story = {
  render: () => <Preview initialValue={{ operator: 'isEmpty' }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const operator = canvas.getByRole('button', {
      name: /^Change Size operator/,
    });
    await userEvent.click(operator);
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    await expect(
      await page.findByRole('dialog', { name: 'Filter by size' })
    ).toBeVisible();
    await expect(operator).toHaveTextContent('is between');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        page.queryByRole('dialog', { name: 'Filter by size' })
      ).not.toBeInTheDocument()
    );
    await expect(operator).toHaveTextContent('is empty');
    await waitFor(() => expect(operator).toHaveFocus());
  },
};
export const ErrorOnlyForWrongRange: Story = {
  render: () => <Preview initialValue={null} />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add size filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    const minimum = editor.getByRole('spinbutton', { name: 'Minimum' });
    const maximum = editor.getByRole('spinbutton', { name: 'Maximum' });
    const apply = editor.getByRole('button', { name: 'Apply' });
    await expect(minimum).toHaveAccessibleDescription('');
    await expect(minimum).toHaveAttribute('aria-invalid', 'false');
    await expect(apply).toBeDisabled();
    await userEvent.type(minimum, '10');
    await expect(minimum).toHaveAccessibleDescription('');
    await expect(minimum).toHaveAttribute('aria-invalid', 'false');
    await expect(apply).toBeDisabled();
    await userEvent.type(maximum, '5');
    await expect(minimum).toHaveAccessibleDescription(
      'Enter an ordered range from 0.'
    );
    await expect(minimum).toHaveAttribute('aria-invalid', 'true');
    await expect(maximum).toHaveAttribute('aria-invalid', 'true');
    await expect(apply).toBeDisabled();
  },
};
export const ReapplySameRange: Story = {
  render: () => <Preview />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const operator = canvas.getByRole('button', {
      name: /^Change Size operator/,
    });
    await userEvent.click(operator);
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    await waitFor(() => expect(operator).toHaveFocus());
    await expect(
      page.queryByRole('dialog', { name: 'Filter by size' })
    ).not.toBeInTheDocument();
    const summary = canvas.getByRole('button', {
      name: 'Edit Size: 100–500 KB',
    });
    await userEvent.click(summary);
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expectEditorClosed(canvasElement, 'Filter by size');
    await waitFor(() => expect(summary).toHaveFocus());
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add size filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '5'
    );
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Maximum' }),
      '50'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: 5,
      max: 50,
    });
    await expectEditorClosed(canvasElement, 'Filter by size');
  },
};
export const SignedDecimalsAndCancel: Story = {
  render: (args) => (
    <Preview
      lowerBound={-100}
      initialValue={{ operator: 'between', min: -10.5, max: 12.5 }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Edit Size: -10.5–12.5 KB',
    });
    await userEvent.click(trigger);
    let editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await userEvent.clear(editor.getByRole('spinbutton', { name: 'Minimum' }));
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '-25.5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Cancel' }));
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(trigger);
    editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await expect(
      editor.getByRole('spinbutton', { name: 'Minimum' })
    ).toHaveValue(-10.5);
    await userEvent.clear(editor.getByRole('spinbutton', { name: 'Maximum' }));
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Maximum' }),
      '-20'
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.clear(editor.getByRole('spinbutton', { name: 'Minimum' }));
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '-25.5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: -25.5,
      max: -20,
    });
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: /^Change Size operator/,
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isEmpty',
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
        name: /^Change Size operator/,
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is between' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by size' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Minimum' }),
      '1'
    );
    await userEvent.type(
      editor.getByRole('spinbutton', { name: 'Maximum' }),
      '5'
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: 1,
      max: 5,
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Edit Size: 100–500 KB',
    });
    await userEvent.click(trigger);
    let minimum = await page.findByRole('spinbutton', { name: 'Minimum' });
    await userEvent.type(minimum, '9');
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    minimum = await page.findByRole('spinbutton', { name: 'Minimum' });
    await expect(minimum).toHaveValue(100);
    await userEvent.type(minimum, '9');
    await userEvent.click(
      canvas.getByText(/A filter is applied|No filter applied/)
    );
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    await userEvent.type(
      await page.findByRole('spinbutton', { name: 'Minimum' }),
      '9'
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by size');
    await expect(
      canvas.getByRole('button', { name: 'Edit Size: 1–2 KB' })
    ).toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const DisabledWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    await userEvent.type(
      await page.findByRole('spinbutton', { name: 'Minimum' }),
      '9'
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by size');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
      ).toBeEnabled()
    );
    await expect(
      page.queryByRole('dialog', { name: 'Filter by size' })
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
      canvas.getByRole('button', { name: 'Edit Size: 100–500 KB' })
    );
    const maximum = await page.findByRole('spinbutton', { name: 'Maximum' });
    await userEvent.clear(maximum);
    await userEvent.type(maximum, '800{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'between',
      min: 100,
      max: 800,
    });
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
