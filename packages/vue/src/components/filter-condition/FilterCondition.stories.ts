import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { defineComponent, type PropType } from 'vue';

import {
  FilterCondition,
  FilterConditionField,
  FilterConditionRemove,
  FilterConditionSegment,
} from '.';

// The play stories' condition; the docs story spells its condition out instead.
const ConditionExample = defineComponent({
  components: {
    FilterCondition,
    FilterConditionField,
    FilterConditionRemove,
    FilterConditionSegment,
  },
  props: {
    field: { type: String, default: 'Status' },
    operator: { type: String, default: 'is' },
    value: { type: String, default: 'Paid' },
    disabled: { type: Boolean, default: false },
    onOperatorClick: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
    onValueClick: {
      type: Function as PropType<() => void>,
      default: undefined,
    },
    onRemove: { type: Function as PropType<() => void>, default: undefined },
  },
  template: `
    <FilterCondition data-testid="condition">
      <FilterConditionField>{{ field }}</FilterConditionField>
      <FilterConditionSegment
        :aria-label="'Edit ' + field + ' operator'"
        class="nx:shrink-0 nx:text-muted-foreground"
        :disabled="disabled"
        @click="onOperatorClick?.()"
      >{{ operator }}</FilterConditionSegment>
      <FilterConditionSegment
        :aria-label="'Edit ' + field + ' value: ' + value"
        data-testid="condition-value"
        :disabled="disabled"
        @click="onValueClick?.()"
      >{{ value }}</FilterConditionSegment>
      <FilterConditionRemove
        :disabled="disabled"
        @click="onRemove?.()"
      >Remove {{ field }} filter</FilterConditionRemove>
    </FilterCondition>
  `,
});

const meta = {
  title: 'Components/FilterCondition',
  component: ConditionExample,
  args: {
    field: 'Status',
    operator: 'is',
    value: 'Paid',
    disabled: false,
    onOperatorClick: fn(),
    onValueClick: fn(),
    onRemove: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'FilterCondition shows one filter as separate field, operator, value and remove parts. Use it when the user edits a filter from its summary. For a chip that only removes, use FilterChip.\n\n- Wrap each FilterConditionSegment in a PopoverTrigger or DropdownMenuTrigger with `as-child`.\n- Your app owns open state, draft values, when changes apply and focus after removal.\n- All parts share one compact height that follows density. There is no `size` prop.\n- Editor inputs set their own size.\n- Segments are native buttons, so Enter and Space activate them.\n- The full summary stays accessible when it truncates on screen.\n- See Patterns/Filtering for recipes that apply changes at once or on Apply.',
      },
    },
  },
  render: (args) => ({
    components: { ConditionExample },
    setup: () => ({ args }),
    template: '<ConditionExample v-bind="args" />',
  }),
} satisfies Meta<typeof ConditionExample>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      FilterCondition,
      FilterConditionField,
      FilterConditionRemove,
      FilterConditionSegment,
    },
    template: `
      <FilterCondition data-testid="condition">
        <FilterConditionField>Status</FilterConditionField>
        <FilterConditionSegment aria-label="Edit Status operator" class="nx:shrink-0 nx:text-muted-foreground">is</FilterConditionSegment>
        <FilterConditionSegment aria-label="Edit Status value: Paid" data-testid="condition-value">Paid</FilterConditionSegment>
        <FilterConditionRemove>Remove Status filter</FilterConditionRemove>
      </FilterCondition>
    `,
  }),
};
export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status operator' })
    );
    await expect(args.onOperatorClick).toHaveBeenCalledTimes(1);
    await expect(args.onValueClick).not.toHaveBeenCalled();
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Edit Status value: Paid' })
    );
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
    await expect(args.onRemove).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    );
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
    await expect(args.onOperatorClick).toHaveBeenCalledTimes(1);
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
  },
};
export const KeyboardInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    canvas.getByRole('button', { name: 'Edit Status operator' }).focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Edit Status value: Paid' })
    ).toHaveFocus();
    await userEvent.keyboard(' ');
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onOperatorClick).toHaveBeenCalledTimes(1);
    await expect(args.onValueClick).toHaveBeenCalledTimes(1);
    await expect(args.onRemove).toHaveBeenCalledTimes(1);
  },
};
export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    for (const button of within(canvasElement).getAllByRole('button')) {
      await expect(button).toBeDisabled();
      button.focus();
      await expect(button).not.toHaveFocus();
    }
    await expect(args.onOperatorClick).not.toHaveBeenCalled();
    await expect(args.onValueClick).not.toHaveBeenCalled();
    await expect(args.onRemove).not.toHaveBeenCalled();
  },
};
export const LongContent: Story = {
  args: {
    field: 'Workspace',
    value: 'Design, Engineering, Research and Customer Operations',
  },
  render: (args) => ({
    components: { ConditionExample },
    setup: () => ({ args }),
    template: `
      <div class="nx:w-80 nx:max-w-full">
        <ConditionExample v-bind="args" />
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: `Edit Workspace value: ${args.value}`,
    });
    await expect(trigger.scrollWidth).toBeLessThanOrEqual(
      trigger.clientWidth + 1
    );
    await expect(
      canvas.getByRole('button', { name: 'Remove Workspace filter' })
    ).toBeVisible();
    const condition = canvas.getByTestId('condition');
    await expect(condition.scrollWidth).toBeLessThanOrEqual(
      condition.clientWidth + 1
    );
  },
};
export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('condition')).toHaveAttribute(
      'data-slot',
      'filter-condition'
    );
    await expect(canvas.getByTestId('condition-value')).toHaveAttribute(
      'data-slot',
      'filter-condition-segment'
    );
    await expect(
      canvas
        .getByTestId('condition')
        .querySelector('[data-slot="filter-condition-field"]')
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Remove Status filter' })
    ).toHaveAttribute('data-slot', 'filter-condition-remove');
  },
};
