import * as React from 'react';

import { TextAaIcon } from '@phosphor-icons/react/ssr';
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

import { type TextCondition, TextFilter } from './text-filter';
import { TextFilterExample } from './text-filter-example';

const initial: TextCondition = { operator: 'contains', value: 'design' };
const replacement: TextCondition = {
  operator: 'contains',
  value: 'operations',
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: TextCondition | null;
  disabled?: boolean;
  onChange?: (value: TextCondition | null) => void;
}) {
  const [value, setValue] = React.useState<TextCondition | null>(initialValue);
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: TextCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="TextFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <TextFilter
        label="Name"
        icon={<TextAaIcon aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
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
          'TextFilter filters records whose text contains, equals, does not equal or starts with a value, or is empty or not empty. Use it for free-text fields such as names or titles. For a fixed set of values, use ChoiceFilter or MultiChoiceFilter.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  render: () => <TextFilterExample />,
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
      canvas.getByRole('button', { name: /^Change Name operator/ })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'contains' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: /^Change Name operator/ })
      ).toHaveFocus()
    );
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
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'research'
    );
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Name:/ }));
    await userEvent.clear(page.getByRole('textbox', { name: 'Name' }));
    await userEvent.type(
      page.getByRole('textbox', { name: 'Name' }),
      'research'
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'research'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Name filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add name filter' })
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
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add name filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by name' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    const input = editor.getByRole('textbox', { name: 'Name' });
    await userEvent.type(input, '   ');
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.type(input, 'ops ');
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'contains',
      value: 'ops',
    });
    await expectEditorClosed(canvasElement, 'Filter by name');
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: /^Change Name operator/,
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'design',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Change Name operator/ })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is empty' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isEmpty',
    });
    await expect(
      canvas.queryByRole('button', { name: /^Edit Name/ })
    ).not.toBeInTheDocument();
    await expectMenuClosed(canvasElement);
  },
};
export const PendingOperatorApplies: Story = {
  render: (args) => (
    <Preview initialValue={{ operator: 'isEmpty' }} onChange={args.onChange} />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: /^Change Name operator/ })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'starts with' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by name' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.type(editor.getByRole('textbox', { name: 'Name' }), 'Ma');
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'startsWith',
      value: 'Ma',
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Name: design' });
    await userEvent.click(trigger);
    let input = await page.findByRole('textbox', { name: 'Name' });
    await userEvent.type(input, ' draft');
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    input = await page.findByRole('textbox', { name: 'Name' });
    await expect(input).toHaveValue('design');
    await userEvent.type(input, ' draft');
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    await userEvent.type(
      await page.findByRole('textbox', { name: 'Name' }),
      ' draft'
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by name');
    await expect(
      canvas.getByRole('button', { name: 'Edit Name: operations' })
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
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    await userEvent.type(
      await page.findByRole('textbox', { name: 'Name' }),
      ' draft'
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by name');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Name: design' })
      ).toBeEnabled()
    );
    await expect(
      page.queryByRole('dialog', { name: 'Filter by name' })
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
      canvas.getByRole('button', { name: 'Edit Name: design' })
    );
    const input = await page.findByRole('textbox', { name: 'Name' });
    await userEvent.clear(input);
    await userEvent.type(input, 'Updated{Enter}');
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'contains',
      value: 'Updated',
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
