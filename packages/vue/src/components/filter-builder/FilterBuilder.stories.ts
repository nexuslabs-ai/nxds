import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  expect,
  fn,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from 'storybook/test';
import { computed, defineComponent, type PropType, ref } from 'vue';

import {
  type FilterField,
  type FilterGroup,
  getFilterErrors,
} from '../../lib/filter-model';
import { Button } from '../button';

import { FilterBuilder } from '.';

const exampleFields: FilterField[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'choice',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'invited', label: 'Invited' },
      { value: 'suspended', label: 'Suspended' },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    type: 'choice',
    options: [
      { value: 'design', label: 'Design' },
      { value: 'engineering', label: 'Engineering' },
      { value: 'operations', label: 'Operations' },
    ],
  },
  { id: 'name', label: 'Name', type: 'text' },
  { id: 'projects', label: 'Projects', type: 'number' },
  { id: 'joined', label: 'Joined', type: 'date' },
];
const exampleTree: FilterGroup = {
  kind: 'group',
  id: 'root',
  conjunction: 'all',
  children: [
    {
      kind: 'rule',
      id: 'status-rule',
      field: 'status',
      operator: 'is',
      value: 'active',
    },
    {
      kind: 'group',
      id: 'team-group',
      conjunction: 'any',
      children: [
        {
          kind: 'rule',
          id: 'team-rule',
          field: 'team',
          operator: 'is',
          value: 'design',
        },
        {
          kind: 'rule',
          id: 'projects-rule',
          field: 'projects',
          operator: 'greaterThan',
          value: '3',
        },
      ],
    },
  ],
};
const simple: FilterGroup = {
  kind: 'group',
  id: 'root',
  conjunction: 'all',
  children: [
    {
      kind: 'rule',
      id: 'status-rule',
      field: 'status',
      operator: 'is',
      value: 'active',
    },
  ],
};

// Reka keeps a closing select or popover mounted for its exit transition, and
// hides the rest of the page from queries until it unmounts.
async function closed() {
  const content = document.querySelector(
    '[data-slot="select-content"], [data-slot="popover-content"]'
  );
  if (content) await waitForElementToBeRemoved(content);
}

const Demo = defineComponent({
  components: { Button, FilterBuilder },
  props: {
    initial: { type: Object as PropType<FilterGroup>, default: exampleTree },
    disabled: { type: Boolean, default: false },
    fields: {
      type: Array as PropType<readonly FilterField[]>,
      default: exampleFields,
    },
    maxDepth: { type: Number, default: 3 },
    onValueChange: {
      type: Function as PropType<(value: FilterGroup) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const value = ref(props.initial);
    const errors = computed(() =>
      getFilterErrors(value.value, props.fields, props.maxDepth)
    );
    function change(next: FilterGroup) {
      value.value = next;
      props.onValueChange?.(next);
    }
    return { value, errors, change };
  },
  template: `
    <div class="nx:grid nx:gap-4">
      <FilterBuilder
        data-example="controlled"
        :fields="fields"
        :value="value"
        :disabled="disabled"
        :max-depth="maxDepth"
        @value-change="change"
      />
      <p role="status" class="nx:typography-body-small nx:text-muted-foreground">
        {{ errors.length ? errors.length + ' incomplete conditions or groups' : 'Ready to apply' }}
      </p>
      <Button variant="outline" @click="value = initial">Reset example</Button>
    </div>
  `,
});

const meta = {
  title: 'Components/FilterBuilder',
  component: FilterBuilder,
  args: {
    fields: exampleFields,
    value: exampleTree,
    'onValue-change': fn(),
    disabled: false,
    maxDepth: 3,
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'FilterBuilder edits filter conditions inside nested All and Any groups. Pass the tree as `value` and update it on `value-change`. For a row of applied filters, use FilterCondition or FilterChip.\n\n- Drafts can be incomplete. Call `getFilterErrors` to validate text, number, date and choice fields.\n- An empty root means no filters. An empty nested group is invalid.\n- The root is depth zero, and `maxDepth` defaults to 3.\n- Dates are `YYYY-MM-DD` strings. Numbers stay as draft strings.\n- Every ID must be unique. Field and option IDs must not be empty.\n- Set `operators` on a field to limit its operators.\n- Your app owns Apply and Cancel, running the query, URLs, permissions and fetching.\n- See the Filtering pattern for grouped conditions and where the app takes over.',
      },
    },
  },
  decorators: [
    () => ({
      template:
        '<div class="nx:mx-auto nx:w-full nx:max-w-5xl nx:p-4"><story /></div>',
    }),
  ],
  render: (args) => ({
    components: { Demo },
    setup: () => ({ args }),
    template: `
      <Demo
        :initial="args.value"
        :fields="args.fields"
        :disabled="args.disabled"
        :max-depth="args.maxDepth"
        :on-value-change="args['onValue-change']"
      />
    `,
  }),
} satisfies Meta<typeof FilterBuilder>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: { FilterBuilder },
    setup: () => ({
      fields: [
        {
          id: 'status',
          label: 'Status',
          type: 'choice',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'invited', label: 'Invited' },
            { value: 'suspended', label: 'Suspended' },
          ],
        },
        {
          id: 'team',
          label: 'Team',
          type: 'choice',
          options: [
            { value: 'design', label: 'Design' },
            { value: 'engineering', label: 'Engineering' },
            { value: 'operations', label: 'Operations' },
          ],
        },
        { id: 'name', label: 'Name', type: 'text' },
        { id: 'projects', label: 'Projects', type: 'number' },
        { id: 'joined', label: 'Joined', type: 'date' },
      ],
      value: ref({
        kind: 'group',
        id: 'root',
        conjunction: 'all',
        children: [
          {
            kind: 'rule',
            id: 'status-rule',
            field: 'status',
            operator: 'is',
            value: 'active',
          },
          {
            kind: 'group',
            id: 'team-group',
            conjunction: 'any',
            children: [
              {
                kind: 'rule',
                id: 'team-rule',
                field: 'team',
                operator: 'is',
                value: 'design',
              },
              {
                kind: 'rule',
                id: 'projects-rule',
                field: 'projects',
                operator: 'greaterThan',
                value: '3',
              },
            ],
          },
        ],
      }),
    }),
    template: `
      <FilterBuilder
        data-example="controlled"
        :fields="fields"
        :value="value"
        @value-change="value = $event"
      />
    `,
  }),
};
export const ValueChange: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Filters match' })
    );
    await userEvent.click(page.getByRole('option', { name: 'Any' }));
    await closed();
    await expect(args['onValue-change']).toHaveBeenCalledWith(
      expect.objectContaining({ conjunction: 'any' })
    );
  },
};
export const Empty: Story = {
  render: () => ({
    components: { Demo },
    template: `<Demo :initial="{ kind: 'group', id: 'empty', conjunction: 'all', children: [] }" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('No conditions. All results are included.')
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add condition' })
    );
    await expect(canvas.getByRole('combobox', { name: 'Field' })).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
    await expect(canvas.queryByText('Enter a value.')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('combobox', { name: 'Field' }));
    await userEvent.click(
      within(canvasElement.ownerDocument.body).getByRole('option', {
        name: 'Team',
      })
    );
    await closed();
    await expect(canvas.getByText('Enter a value.')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Team condition' })
    );
    await expect(
      canvas.getByRole('button', { name: 'Add condition' })
    ).toHaveFocus();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
  },
};
const RestoredIdsDemo = defineComponent({
  components: { Button, FilterBuilder },
  setup() {
    const value = ref<FilterGroup>({
      kind: 'group',
      id: 'root',
      conjunction: 'all',
      children: [],
    });
    // Swaps the probe rule for a saved one holding the ID the next Add would generate, as a tree saved on an earlier page load can.
    function restoreSavedTree() {
      const [probe] = value.value.children;
      const nextId = (probe?.id ?? '').replace(/\d+$/, (count) =>
        String(Number(count) + 1)
      );
      value.value = {
        ...value.value,
        children: [
          {
            kind: 'rule',
            id: nextId,
            field: 'status',
            operator: 'is',
            value: 'active',
          },
        ],
      };
    }
    return { exampleFields, value, restoreSavedTree };
  },
  template: `
    <div class="nx:grid nx:gap-4">
      <FilterBuilder :fields="exampleFields" :value="value" @value-change="value = $event" />
      <Button variant="outline" @click="restoreSavedTree">Restore saved filters</Button>
    </div>
  `,
});
export const RestoredIdsStayUnique: Story = {
  render: () => ({
    components: { RestoredIdsDemo },
    template: '<RestoredIdsDemo />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    function nodeIds() {
      return Array.from(
        canvasElement.querySelectorAll<HTMLElement>('[data-node-id]'),
        (node) => node.dataset.nodeId
      );
    }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add condition' })
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore saved filters' })
    );
    const [restoredId] = nodeIds();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add condition' })
    );
    const ids = nodeIds();
    await expect(ids).toHaveLength(2);
    await expect(new Set(ids).size).toBe(2);
    await expect(ids[0]).toBe(restoredId);
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Remove Status condition' })[0]!
    );
    await expect(nodeIds()).toEqual([ids[1]]);
  },
};
export const OperatorAndFieldChanges: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({ simple }),
    template: '<Demo :initial="simple" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Status operator' })
    );
    await userEvent.click(page.getByRole('option', { name: 'is empty' }));
    await closed();
    await expect(
      canvas.queryByRole('combobox', { name: 'Status value' })
    ).not.toBeInTheDocument();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await userEvent.click(canvas.getByRole('combobox', { name: 'Field' }));
    await userEvent.click(page.getByRole('option', { name: 'Projects' }));
    await closed();
    await expect(
      canvas.getByRole('spinbutton', { name: 'Projects value' })
    ).toHaveValue(null);
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
    await userEvent.type(
      canvas.getByRole('spinbutton', { name: 'Projects value' }),
      '-2'
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset example' })
    );
    await expect(
      canvas.getByRole('combobox', { name: 'Status value' })
    ).toHaveTextContent('Active');
  },
};
export const KeyboardInteraction: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({ simple }),
    template: '<Demo :initial="simple" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    canvas.getByRole('combobox', { name: 'Status operator' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(page.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await closed();
    await expect(
      canvas.getByRole('combobox', { name: 'Status operator' })
    ).toHaveTextContent('is not');
    await waitFor(() =>
      expect(
        canvas.getByRole('combobox', { name: 'Status operator' })
      ).toHaveFocus()
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole('combobox', { name: 'Status value' })
    ).toHaveFocus();
  },
};
export const MultipleChoices: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({
      initial: {
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'teams',
            field: 'team',
            operator: 'isAnyOf',
            value: ['design'],
          },
        ],
      },
    }),
    template: '<Demo :initial="initial" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Team values' }));
    await userEvent.click(page.getByRole('checkbox', { name: 'Engineering' }));
    await expect(
      canvas.getByRole('button', { name: 'Team values' })
    ).toHaveTextContent('Design, Engineering');
    await userEvent.type(
      page.getByRole('textbox', { name: 'Search Team options' }),
      'missing'
    );
    await expect(page.getByText('No options found.')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Team values' })).toHaveFocus()
    );
  },
};
export const RangeValidation: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({
      initial: {
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'range',
            field: 'projects',
            operator: 'between',
            value: ['5', '2'],
          },
        ],
      },
    }),
    template: '<Demo :initial="initial" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('The start must not be after the end.')
    ).toBeVisible();
    await userEvent.clear(
      canvas.getByRole('spinbutton', { name: 'Projects start' })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
    await userEvent.type(
      canvas.getByRole('spinbutton', { name: 'Projects start' }),
      '0'
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
  },
};
export const NestedGroups: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({ simple }),
    template: '<Demo :initial="simple" :max-depth="1" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Add group' }));
    const nested = within(
      canvas.getByRole('group', { name: 'Filters group 2' })
    );
    await expect(
      nested.queryByRole('button', { name: 'Add group' })
    ).not.toBeInTheDocument();
    await userEvent.click(
      nested.getByRole('button', { name: 'Remove Status condition' })
    );
    await expect(
      nested.getByText('Add a condition or remove this group.')
    ).toBeVisible();
    await userEvent.click(
      nested.getByRole('button', { name: 'Remove Filters group 2' })
    );
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await expect(
      canvas.getByRole('button', { name: 'Add condition' })
    ).toHaveFocus();
  },
};
export const InvalidExternalValues: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({
      initial: {
        ...exampleTree,
        children: [
          ...exampleTree.children,
          {
            kind: 'rule',
            id: 'unknown',
            field: 'removed',
            operator: 'is',
            value: 'x',
          },
          {
            kind: 'rule',
            id: 'date',
            field: 'joined',
            operator: 'is',
            value: '2026-02-31',
          },
          {
            kind: 'rule',
            id: 'hex',
            field: 'projects',
            operator: 'is',
            value: '0x10',
          },
          {
            kind: 'rule',
            id: 'overflow',
            field: 'projects',
            operator: 'is',
            value: '1e999',
          },
          {
            kind: 'rule',
            id: 'stale',
            field: 'status',
            operator: 'is',
            value: 'deleted',
          },
        ],
      },
    }),
    template: '<Demo :max-depth="0" :initial="initial" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Choose an available field.')).toBeVisible();
    await expect(canvas.getByText('Enter a valid date.')).toBeVisible();
    await expect(canvas.getAllByText('Enter a valid number.')).toHaveLength(2);
    await expect(canvas.getByText('Choose an available option.')).toBeVisible();
    // The stale rule is appended last.
    const statusValues = canvas.getAllByRole('combobox', {
      name: 'Status value',
    });
    await expect(statusValues[statusValues.length - 1]).toHaveTextContent(
      'Unavailable selection'
    );
    await expect(
      canvas.getByText('Use at most 0 levels of nested groups.')
    ).toBeVisible();
  },
};
export const Disabled: Story = {
  render: () => ({
    components: { Demo },
    template: '<Demo disabled />',
  }),
  play: async ({ canvasElement }) => {
    const group = within(
      within(canvasElement).getByRole('group', { name: 'Filters' })
    );
    for (const control of [
      ...group.getAllByRole('button'),
      ...group.getAllByRole('combobox'),
      ...group.getAllByRole('spinbutton'),
    ])
      await expect(control).toBeDisabled();
  },
};
export const WithDataAttributes: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="filter-builder"]')
    ).toHaveAttribute('data-example', 'controlled');
  },
};

export const TextAndDates: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({
      initial: {
        ...simple,
        children: [
          {
            kind: 'rule',
            id: 'name',
            field: 'name',
            operator: 'contains',
            value: 'Priya',
          },
          {
            kind: 'rule',
            id: 'date',
            field: 'joined',
            operator: 'between',
            value: ['2026-09-01', '2026-09-25'],
          },
        ],
      },
    }),
    template: '<Demo :initial="initial" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Ready to apply'
    );
    await userEvent.clear(canvas.getByRole('textbox', { name: 'Name value' }));
    await expect(canvas.getByText('Enter a value.')).toBeVisible();
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Name value' }),
      'Maya'
    );
    await expect(canvas.getByLabelText('Joined start')).toHaveValue(
      '2026-09-01'
    );
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Joined operator' })
    );
    await userEvent.click(page.getByRole('option', { name: 'is before' }));
    await closed();
    await expect(canvas.getByLabelText('Joined value')).toHaveValue('');
    await expect(canvas.getByRole('status')).toHaveTextContent('1 incomplete');
  },
};
export const RestrictedOperators: Story = {
  render: () => ({
    components: { Demo },
    setup: () => ({
      simple,
      fields: exampleFields.map((field) => ({
        ...field,
        operators: ['is', 'isNot'],
      })),
    }),
    template: '<Demo :initial="simple" :fields="fields" />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement),
      page = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      canvas.getByRole('combobox', { name: 'Status operator' })
    );
    await expect(page.getAllByRole('option')).toHaveLength(2);
    await userEvent.keyboard('{Escape}');
    await closed();
  },
};
