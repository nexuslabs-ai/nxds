import * as React from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  DialogHost,
  dispatchStoryEvent,
  expectFocus,
  expectMenuClosed,
  useStoryEvent,
} from '../filter.story-utils';

import { type ChoiceCondition, ChoiceFilter } from './choice-filter';
import { ChoiceFilterExample } from './choice-filter-example';

const replacement: ChoiceCondition = { operator: 'is', value: 'suspended' };
function Preview({
  initialValue = { operator: 'is', value: 'active' },
  disabled = false,
  onChange,
}: {
  initialValue?: ChoiceCondition | null;
  disabled?: boolean;
  onChange?: (value: ChoiceCondition | null) => void;
}) {
  const [value, setValue] = React.useState<ChoiceCondition | null>(
    initialValue
  );
  const [isDisabled, setDisabled] = React.useState(disabled);
  useStoryEvent('story:replace', () => setValue(replacement));
  useStoryEvent('story:toggle-disabled', () =>
    setDisabled((current) => !current)
  );
  function change(next: ChoiceCondition | null) {
    setValue(next);
    onChange?.(next);
  }
  return (
    <div className="nx:grid nx:w-full nx:min-w-0 nx:max-w-xl nx:justify-items-start nx:gap-4 nx:p-4">
      <ChoiceFilter
        label="Status"
        value={value}
        onChange={change}
        disabled={isDisabled}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'invited', label: 'Invited' },
          { value: 'suspended', label: 'Suspended' },
          { value: 'restricted', label: 'Restricted', disabled: true },
        ]}
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
          'ChoiceFilter filters by one value from a short list and applies it at once. Use it for a few mutually exclusive options. To match several values, use MultiChoiceFilter.',
      },
    },
  },
} satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  render: () => <ChoiceFilterExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add status filter' })
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
export const UnavailableOption: Story = {
  render: (args) => (
    <Preview
      initialValue={{ operator: 'is', value: 'retired-id' }}
      onChange={args.onChange}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Edit Status: retired-id (unavailable)',
    });
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('menuitemradio', {
        name: 'retired-id (unavailable)',
      })
    ).toHaveAttribute('aria-checked', 'true');
    await expect(
      page.getByRole('menuitemradio', { name: 'retired-id (unavailable)' })
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Active' }));
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'active',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const SelectCommits: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Restricted' })
    ).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(page.getByRole('menuitemradio', { name: 'Invited' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'invited',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const AddFromNothing: Story = {
  render: (args) => <Preview initialValue={null} onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Add status filter' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Suspended' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'is',
      value: 'suspended',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const OperatorKeepsValue: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Change Status operator',
      })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is not' }));
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNot',
      value: 'active',
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
        name: 'Change Status operator',
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
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is' }));
    await expect(
      await page.findByRole('menuitemradio', { name: 'Active' })
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Edit Status: Choose…', hidden: true })
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(page.queryByRole('menu')).not.toBeInTheDocument()
    );
    await expect(
      canvas.getByRole('button', { name: 'Change Status operator' })
    ).toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Change Status operator' })
    );
    await userEvent.click(page.getByRole('menuitemradio', { name: 'is not' }));
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    );
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await expect(args.onChange).toHaveBeenLastCalledWith({
      operator: 'isNot',
      value: 'invited',
    });
    await expectMenuClosed(canvasElement);
  },
};
export const AnyRemovesFilter: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await userEvent.click(
      await page.findByRole('menuitemradio', { name: 'Any status' })
    );
    await expect(args.onChange).toHaveBeenLastCalledWith(null);
    await expectMenuClosed(canvasElement);
    await expectFocus(
      canvas.getByRole('button', { name: 'Add status filter' })
    );
  },
};
export const ExternalReplaceWhileOpen: Story = {
  render: (args) => <Preview onChange={args.onChange} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    ).toBeVisible();
    dispatchStoryEvent('story:replace');
    await expectMenuClosed(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Edit Status: Suspended' })
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
      canvas.getByRole('button', { name: 'Edit Status: Active' })
    );
    await expect(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    ).toBeVisible();
    dispatchStoryEvent('story:toggle-disabled');
    await expectMenuClosed(canvasElement);
    for (const button of canvas.getAllByRole('button'))
      await expect(button).toBeDisabled();
    dispatchStoryEvent('story:toggle-disabled');
    await waitFor(() =>
      expect(
        canvas.getByRole('button', { name: 'Edit Status: Active' })
      ).toBeEnabled()
    );
    await expect(page.queryByRole('menu')).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
export const InsideDialog: Story = {
  render: (args) => (
    <DialogHost>
      <Preview onChange={args.onChange} />
    </DialogHost>
  ),
  play: async ({ canvasElement, args }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Open filter settings',
      })
    );
    const host = await page.findByRole('dialog', { name: 'Filter settings' });
    const trigger = within(host).getByRole('button', {
      name: 'Edit Status: Active',
    });
    await userEvent.click(trigger);
    await expect(
      await page.findByRole('menuitemradio', { name: 'Invited' })
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expectMenuClosed(canvasElement);
    await expect(host).toHaveAttribute('data-state', 'open');
    await expectFocus(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(host).toHaveAttribute('data-state', 'closed'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
