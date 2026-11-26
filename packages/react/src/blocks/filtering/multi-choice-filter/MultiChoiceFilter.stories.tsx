import * as React from 'react';

import { UsersIcon } from '@phosphor-icons/react/ssr';
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
  type MultiChoiceCondition,
  MultiChoiceFilter,
} from './multi-choice-filter';
import { MultiChoiceFilterExample } from './multi-choice-filter-example';

const initial: MultiChoiceCondition = {
  operator: 'isAnyOf',
  values: ['design'],
};
const replacement: MultiChoiceCondition = {
  operator: 'isAnyOf',
  values: ['engineering'],
};
function Preview({
  initialValue = initial,
  disabled = false,
  onChange,
}: {
  initialValue?: MultiChoiceCondition | null;
  disabled?: boolean;
  onChange?: (value: MultiChoiceCondition | null) => void;
}) {
  const [value, setValue] = React.useState<MultiChoiceCondition | null>(
    initialValue
  );
  const [options, setOptions] = React.useState([
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'operations', label: 'Operations', disabled: true },
  ]);
  useStoryEvent('story:load-options', () =>
    setOptions((current) => [
      ...current,
      { value: 'research', label: 'Research' },
    ])
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: MultiChoiceCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <section
      aria-label="MultiChoiceFilter example"
      className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4"
    >
      <MultiChoiceFilter
        label="Team"
        icon={<UsersIcon aria-hidden="true" />}
        value={value}
        onChange={change}
        disabled={isDisabled}
        options={options}
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
          'MultiChoiceFilter filters by several values from a list, applied when users press Apply. Use it when a record can match any of several values. For one quick choice, use ChoiceFilter.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  render: () => <MultiChoiceFilterExample />,
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
      canvas.getByRole('button', { name: /^Change Team operator/ })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is any of' })
    );
    await expect(await page.findByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      'isEmpty'
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: /^Change Team operator/ })
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
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(page.getByRole('button', { name: 'Cancel' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      '"engineering"'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Team filter' })
    );
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Add team filter' })
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

export const IncompleteDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const before = canvas.getByLabelText('Applied condition').textContent ?? '';
    await userEvent.click(canvas.getByRole('button', { name: /^Edit Team:/ }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Design' }));
    await expect(
      page.getByRole('checkbox', { name: 'Operations' })
    ).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.getByLabelText('Applied condition')).toHaveTextContent(
      before
    );
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: /^Edit Team:/ })).toHaveFocus()
    );
  },
};

export const UnavailableOption: Story = {
  render: () => (
    <Preview
      initialValue={{ operator: 'isAnyOf', values: ['design', 'retired-id'] }}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', {
        name: 'Edit Team: Design, retired-id (unavailable)',
      })
    ).toBeInTheDocument();
  },
};
export const OptionsLoadWhileOpen: Story = {
  render: () => <Preview />,
  play: async ({ canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit Team: Design' })
    );
    const dialog = await page.findByRole('dialog', { name: 'Filter by team' });
    const editor = within(dialog);
    await userEvent.click(
      editor.getByRole('checkbox', { name: 'Engineering' })
    );
    dispatchStoryEvent('story:load-options');
    await expect(
      await editor.findByRole('checkbox', { name: 'Research' })
    ).toBeVisible();
    await expect(dialog).toHaveAttribute('data-state', 'open');
    await expect(
      editor.getByRole('checkbox', { name: 'Engineering' })
    ).toBeChecked();
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add team filter' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by team' })
    );
    await expect(editor.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await expect(
      editor.getByRole('checkbox', { name: 'Operations' })
    ).toBeDisabled();
    await userEvent.click(editor.getByRole('checkbox', { name: 'Design' }));
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isAnyOf',
      values: ['design'],
    });
    await expectEditorClosed(canvasElement, 'Filter by team');
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: /^Change Team operator/,
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is none of' })
    );
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNoneOf',
      values: ['design'],
    });
    await expectMenuClosed(canvasElement);
  },
};
export const ValuelessOperatorCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: /^Change Team operator/,
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
        name: /^Change Team operator/,
      })
    );
    await userEvent.click(
      page.getByRole('menuitemradio', { name: 'is none of' })
    );
    const editor = within(
      await page.findByRole('dialog', { name: 'Filter by team' })
    );
    await expect(args.onChange).not.toHaveBeenCalled();
    await userEvent.click(
      editor.getByRole('checkbox', { name: 'Engineering' })
    );
    await userEvent.click(editor.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNoneOf',
      values: ['engineering'],
    });
  },
};
export const DismissDiscardsDraft: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Edit Team: Design' });
    await userEvent.click(trigger);
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by team');
    await expectFocus(trigger);
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('checkbox', { name: 'Engineering' })
    ).not.toBeChecked();
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await userEvent.click(canvas.getByLabelText('Applied condition'));
    await expectEditorClosed(canvasElement, 'Filter by team');
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('checkbox', { name: 'Engineering' })
    ).not.toBeChecked();
    await userEvent.keyboard('{Escape}');
    await expectEditorClosed(canvasElement, 'Filter by team');
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Team: Design' })
    );
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    dispatchStoryEvent('story:replace');
    await expectEditorClosed(canvasElement, 'Filter by team');
    await expect(
      canvas.getByRole('button', { name: 'Edit Team: Engineering' })
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
      canvas.getByRole('button', { name: 'Edit Team: Design' })
    );
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    dispatchStoryEvent('story:toggle-disabled');
    await expectEditorClosed(canvasElement, 'Filter by team');
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Team: Design' })
      ).toBeEnabled()
    );
    await expect(
      page.queryByRole('dialog', { name: 'Filter by team' })
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
      canvas.getByRole('button', { name: 'Edit Team: Design' })
    );
    await userEvent.click(
      await page.findByRole('checkbox', { name: 'Engineering' })
    );
    await userEvent.click(page.getByRole('button', { name: 'Apply' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isAnyOf',
      values: ['design', 'engineering'],
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
