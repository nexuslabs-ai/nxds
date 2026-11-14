import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  type ComponentPublicInstance,
  defineComponent,
  type PropType,
  ref,
} from 'vue';

import { expectImmediateItemMotion } from '../../stories/support/motion-test-utils';
import { Checkbox } from '../checkbox';
import { Field, FieldDescription, FieldError, FieldLabel } from '../field';

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectSeparator,
  MultiSelectTrigger,
  MultiSelectValue,
} from '.';

const FRAMEWORKS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
  { value: 'solid', label: 'Solid' },
  { value: 'qwik', label: 'Qwik' },
];

/**
 * Optical centering slack for the `+N` chip label. Sub-pixel text metrics drift
 * ~0.5px; losing the chip's flex centering drifts ~2.5px.
 */
const MAX_LABEL_DRIFT_PX = 1;

// The play stories' picker; each docs story spells its picker out instead.
const Frameworks = defineComponent({
  components: {
    MultiSelect,
    MultiSelectContent,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
  },
  props: {
    defaultValues: { type: Array as PropType<string[]>, default: undefined },
  },
  setup: () => ({ frameworks: FRAMEWORKS }),
  template: `
    <MultiSelect :default-values="defaultValues">
      <MultiSelectTrigger aria-label="Frameworks" class="nx:w-80">
        <MultiSelectValue>
          <template #placeholder>Select frameworks</template>
        </MultiSelectValue>
      </MultiSelectTrigger>
      <MultiSelectContent search-placeholder="Search frameworks…">
        <template #empty-message>No frameworks found.</template>
        <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
      </MultiSelectContent>
    </MultiSelect>
  `,
});

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MultiSelect lets the user search a list and pick several options, shown as chips. Use it for tags, filters and other choices with several answers. For one option, use Combobox or Select.',
      },
    },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  tags: ['docs'],
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    setup: () => ({
      frameworks: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'angular', label: 'Angular' },
        { value: 'solid', label: 'Solid' },
        { value: 'qwik', label: 'Qwik' },
      ],
    }),
    template: `
      <MultiSelect>
        <MultiSelectTrigger aria-label="Frameworks" class="nx:w-80">
          <MultiSelectValue>
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent search-placeholder="Search frameworks…">
          <template #empty-message>No frameworks found.</template>
          <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
};

export const Grouped: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Sort options under headings with MultiSelectGroup and a separator.',
      },
    },
  },
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectGroup,
      MultiSelectItem,
      MultiSelectSeparator,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    template: `
      <MultiSelect :default-values="['react']">
        <MultiSelectTrigger aria-label="Frameworks" class="nx:w-80">
          <MultiSelectValue>
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent search-placeholder="Search frameworks…">
          <template #empty-message>No frameworks found.</template>
          <MultiSelectGroup heading="Libraries">
            <MultiSelectItem value="react">React</MultiSelectItem>
            <MultiSelectItem value="solid">Solid</MultiSelectItem>
          </MultiSelectGroup>
          <MultiSelectSeparator />
          <MultiSelectGroup heading="Frameworks">
            <MultiSelectItem value="vue">Vue</MultiSelectItem>
            <MultiSelectItem value="svelte">Svelte</MultiSelectItem>
            <MultiSelectItem value="angular">Angular</MultiSelectItem>
          </MultiSelectGroup>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
};

export const WrapChips: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `overflowBehavior="wrap"` to wrap every chip onto more lines.',
      },
    },
  },
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    setup: () => ({
      frameworks: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'angular', label: 'Angular' },
        { value: 'solid', label: 'Solid' },
        { value: 'qwik', label: 'Qwik' },
      ],
    }),
    template: `
      <MultiSelect :default-values="['react', 'vue', 'svelte', 'angular', 'solid']">
        <MultiSelectTrigger aria-label="Frameworks" class="nx:w-72">
          <MultiSelectValue overflow-behavior="wrap">
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent search-placeholder="Search frameworks…">
          <template #empty-message>No frameworks found.</template>
          <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
};

export const OverflowCollapse: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `overflowBehavior="cutoff"` to show chips that don\'t fit as a `+N` badge.',
      },
    },
  },
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    setup: () => ({
      frameworks: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'angular', label: 'Angular' },
        { value: 'solid', label: 'Solid' },
        { value: 'qwik', label: 'Qwik' },
      ],
    }),
    template: `
      <MultiSelect :default-values="['react', 'vue', 'svelte', 'angular', 'solid', 'qwik']">
        <MultiSelectTrigger aria-label="Frameworks" class="nx:w-64">
          <MultiSelectValue overflow-behavior="cutoff">
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent search-placeholder="Search frameworks…">
          <template #empty-message>No frameworks found.</template>
          <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Six chips overflow the 256px field, so measurement collapses the excess
    // into a visible `+N` badge.
    await waitFor(() => expect(canvas.getByText(/^\+\d+$/)).toBeVisible());

    const overflow = canvasElement.querySelector<HTMLElement>(
      '[data-slot="multi-select-overflow"]'
    )!;
    const box = overflow.getBoundingClientRect();
    const range = document.createRange();
    range.selectNodeContents(overflow);
    const label = range.getBoundingClientRect();
    expect(
      Math.abs((label.top + label.bottom) / 2 - (box.top + box.bottom) / 2)
    ).toBeLessThan(MAX_LABEL_DRIFT_PX);
  },
};

export const Disabled: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Disable the trigger to show the selection without letting anyone change it.',
      },
    },
  },
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    setup: () => ({
      frameworks: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'angular', label: 'Angular' },
        { value: 'solid', label: 'Solid' },
        { value: 'qwik', label: 'Qwik' },
      ],
    }),
    template: `
      <MultiSelect :default-values="['react']">
        <MultiSelectTrigger aria-label="Frameworks" disabled class="nx:w-80">
          <MultiSelectValue>
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent>
          <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // The default value is still labeled while disabled.
    await expect(within(trigger).getByText('React')).toBeInTheDocument();
  },
};

export const WithDisabledOption: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Disable one option so it shows in the list but cannot be picked.',
      },
    },
  },
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    template: `
      <MultiSelect>
        <MultiSelectTrigger aria-label="Frameworks" class="nx:w-80">
          <MultiSelectValue>
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent search-placeholder="Search frameworks…">
          <template #empty-message>No frameworks found.</template>
          <MultiSelectItem value="react">React</MultiSelectItem>
          <MultiSelectItem value="vue" disabled>Vue</MultiSelectItem>
          <MultiSelectItem value="svelte">Svelte</MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    const disabled = await body.findByRole('option', { name: 'Vue' });

    // A disabled option is inert (pointer-events: none) and cannot be selected.
    await expect(disabled).toHaveAttribute('data-disabled', 'true');
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(within(trigger).queryByText('Vue')).toBeNull();
  },
};

export const InvalidField: Story = {
  tags: ['docs'],
  parameters: {
    docs: {
      description: {
        story:
          'Set `aria-invalid` on the trigger inside an invalid Field to show the error state.',
      },
    },
  },
  render: () => ({
    components: {
      Field,
      FieldDescription,
      FieldError,
      FieldLabel,
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    setup: () => ({
      frameworks: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'angular', label: 'Angular' },
        { value: 'solid', label: 'Solid' },
        { value: 'qwik', label: 'Qwik' },
      ],
    }),
    template: `
      <Field data-invalid>
        <FieldLabel>Frameworks</FieldLabel>
        <MultiSelect>
          <MultiSelectTrigger aria-label="Frameworks" aria-invalid="true" class="nx:w-80">
            <MultiSelectValue>
              <template #placeholder>Select frameworks</template>
            </MultiSelectValue>
          </MultiSelectTrigger>
          <MultiSelectContent search-placeholder="Search frameworks…">
            <template #empty-message>No frameworks found.</template>
            <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
          </MultiSelectContent>
        </MultiSelect>
        <FieldDescription>Choose at least one framework.</FieldDescription>
        <FieldError>Framework selection is required.</FieldError>
      </Field>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toHaveAttribute('aria-invalid', 'true');
  },
};

export const ClickInteraction: Story = {
  render: () => ({
    components: { Frameworks },
    template: '<Frameworks />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    await userEvent.click(await body.findByRole('option', { name: 'React' }));
    await userEvent.click(body.getByRole('option', { name: 'Svelte' }));

    await expect(within(trigger).getByText('React')).toBeInTheDocument();
    await expect(within(trigger).getByText('Svelte')).toBeInTheDocument();
  },
};

export const KeyboardInteraction: Story = {
  render: () => ({
    components: { Frameworks },
    template: '<Frameworks />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    const search = await body.findByPlaceholderText('Search frameworks…');

    // Reka moves focus into the list on open, so arrow/type nav is live
    // immediately — no manual click into the search box required.
    await waitFor(() => expect(search).toHaveFocus());

    await userEvent.keyboard('sve');
    await userEvent.keyboard('{Enter}');

    await expect(within(trigger).getByText('Svelte')).toBeInTheDocument();
  },
};

export const ChipRemoval: Story = {
  render: () => ({
    components: { Frameworks },
    template: `<Frameworks :default-values="['react', 'vue']" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(within(trigger).getByText('React')).toBeInTheDocument();
    await userEvent.click(within(trigger).getByText('React'));

    await waitFor(() =>
      expect(within(trigger).queryByText('React')).toBeNull()
    );
    await expect(within(trigger).getByText('Vue')).toBeInTheDocument();
  },
};

export const ChipKeyboardRemoval: Story = {
  render: () => ({
    components: { Frameworks },
    template: `<Frameworks :default-values="['react', 'vue']" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    // Backspace on the focused field removes the last selected value without
    // reopening the list — the keyboard equivalent of clicking a chip's X.
    trigger.focus();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Backspace}');

    await waitFor(() => expect(within(trigger).queryByText('Vue')).toBeNull());
    await expect(within(trigger).getByText('React')).toBeInTheDocument();
  },
};

// Removing the last chip swaps the value row for the placeholder.
export const LastChipRemoval: Story = {
  render: () => ({
    components: { Frameworks },
    template: `<Frameworks :default-values="['react']" />`,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(within(trigger).getByText('React'));

    await expect(
      await within(trigger).findByText('Select frameworks')
    ).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-slot="multi-select-value"]')
    ).toBeNull();
  },
};

const overflowValueRef = ref<ComponentPublicInstance | null>(null);

// A template ref on MultiSelectValue reaches the row, and chips still collapse.
export const OverflowWithRef: Story = {
  render: () => ({
    components: {
      MultiSelect,
      MultiSelectContent,
      MultiSelectItem,
      MultiSelectTrigger,
      MultiSelectValue,
    },
    setup: () => ({ frameworks: FRAMEWORKS, overflowValueRef }),
    template: `
      <MultiSelect :default-values="['react', 'vue', 'svelte', 'angular', 'solid', 'qwik']">
        <MultiSelectTrigger aria-label="Frameworks" class="nx:w-64">
          <MultiSelectValue ref="overflowValueRef" overflow-behavior="cutoff">
            <template #placeholder>Select frameworks</template>
          </MultiSelectValue>
        </MultiSelectTrigger>
        <MultiSelectContent search-placeholder="Search frameworks…">
          <template #empty-message>No frameworks found.</template>
          <MultiSelectItem v-for="option in frameworks" :key="option.value" :value="option.value">{{ option.label }}</MultiSelectItem>
        </MultiSelectContent>
      </MultiSelect>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText(/^\+\d+$/)).toBeVisible());
    await expect(overflowValueRef.value?.$el).toHaveAttribute(
      'data-slot',
      'multi-select-value'
    );
  },
};

export const SearchEmpty: Story = {
  render: () => ({
    components: { Frameworks },
    template: '<Frameworks />',
  }),
  parameters: {
    a11y: {
      // The no-results state legitimately renders an empty listbox; axe's
      // aria-required-children flags the transient absence of option children,
      // which is expected here. All other a11y rules stay enabled.
      options: { rules: { 'aria-required-children': { enabled: false } } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await userEvent.click(trigger);
    await userEvent.type(
      await body.findByPlaceholderText('Search frameworks…'),
      'zzz'
    );

    await expect(body.getByText('No frameworks found.')).toBeInTheDocument();
  },
};

export const WithDataAttributes: Story = {
  render: () => ({
    components: { Frameworks },
    template: '<Frameworks />',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toHaveAttribute('data-slot', 'multi-select-trigger');
    await expect(trigger).toHaveClass('nx:bg-container');
    await expect(trigger).toHaveClass('nx:enabled:hover:bg-container-hover');

    await userEvent.click(trigger);
    const listbox = await body.findByRole('listbox');
    const options = Array.from(
      listbox.querySelectorAll('[data-slot="multi-select-item"]')
    );
    await expectImmediateItemMotion(options);
    const option = await body.findByRole('option', { name: 'React' });

    await expect(option).toHaveAttribute('data-slot', 'multi-select-item');
    await userEvent.click(option);
    await expect(option).toHaveAttribute('data-checked', 'true');
  },
};

export const IndicatorMatchesCheckboxAtLargerScale: Story = {
  // The option box grows with the UI scale, as a Checkbox does.
  globals: { uiScale: 'larger' },
  render: () => ({
    components: { Checkbox, Frameworks },
    template: `
      <div class="nx:flex nx:flex-col nx:gap-4">
        <Checkbox aria-label="Notify me" />
        <Frameworks :default-values="['react']" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const checkbox = canvas.getByRole('checkbox').getBoundingClientRect();

    await userEvent.click(canvas.getByRole('button', { name: 'Frameworks' }));
    const option = await body.findByRole('option', { name: 'React' });
    const indicator = option
      .querySelector('[data-slot="multi-select-indicator"]')!
      .getBoundingClientRect();

    await expect(indicator.width).toBe(checkbox.width);
    await expect(indicator.height).toBe(checkbox.height);
  },
};
