import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, type Mock, userEvent, within } from 'storybook/test';

import { FilterChip } from '.';

// `click` and `disabled` fall through to the native button, so they are not declared props.
type FilterChipArgs = InstanceType<typeof FilterChip>['$props'] & {
  onClick: Mock<(event: MouseEvent) => void>;
  disabled?: boolean;
};

const meta = {
  title: 'Components/FilterChip',
  component: FilterChip,
  args: {
    ariaLabel: 'Remove status filter: Active',
    onClick: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'FilterChip is a button that removes an applied filter. Use it in a row of applied filters chosen in a menu or panel. For passive metadata use Badge, and for a condition the user edits use FilterCondition.\n\n- Clicking the label or × removes the filter. It never opens an editor or toggles a choice.\n- Give it a full `aria-label`, such as "Remove status filter: Paid".\n- Your app owns the filter values. After removal, move focus to the next chip, the previous chip or a stable filter control.\n- Long labels truncate on screen but keep their full accessible name.\n- It has one compact size that follows the density setting.',
      },
    },
  },
  render: (args) => ({
    components: { FilterChip },
    setup: () => ({ args }),
    template: '<FilterChip v-bind="args">Status: Active</FilterChip>',
  }),
} satisfies Meta<FilterChipArgs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { FilterChip },
    template:
      '<FilterChip aria-label="Remove status filter: Active">Status: Active</FilterChip>',
  }),
};
export const ClickInteraction: Story = {
  render: (args) => ({
    components: { FilterChip },
    setup: () => ({ args }),
    template: `
      <form aria-label="Filter form" @submit.prevent>
        <FilterChip v-bind="args">Status: Active</FilterChip>
      </form>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const submit = fn();
    const form = canvas.getByRole('form');
    form.addEventListener('submit', submit);
    try {
      await userEvent.click(canvas.getByRole('button'));
      await expect(args.onClick).toHaveBeenCalledTimes(1);
      await expect(submit).not.toHaveBeenCalled();
    } finally {
      form.removeEventListener('submit', submit);
    }
  },
};
export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button');
    await expect(button).toBeDisabled();
    button.click();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};
export const WithDataAttributes: Story = {
  render: (args) => ({
    components: { FilterChip },
    setup: () => ({ args }),
    template:
      '<FilterChip v-bind="args" data-testid="applied-filter">Status: Active</FilterChip>',
  }),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByTestId('applied-filter')
    ).toHaveAttribute('data-slot', 'filter-chip');
  },
};
export const LongLabel: Story = {
  args: {
    ariaLabel: 'Remove owner filter: InternationalCustomerExperienceOperations',
  },
  render: (args) => ({
    components: { FilterChip },
    setup: () => ({ args }),
    template: `
      <div class="nx:w-full nx:max-w-48">
        <FilterChip v-bind="args">Owner: InternationalCustomerExperienceOperations</FilterChip>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Remove owner filter: InternationalCustomerExperienceOperations',
    });
    await expect(button.getBoundingClientRect().width).toBeLessThanOrEqual(
      button.parentElement!.getBoundingClientRect().width
    );
  },
};
