import type { StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { defineComponent, type PropType } from 'vue';

import { expectImmediateItemMotion } from '../../stories/support/motion-test-utils';
import { Checkbox } from '../checkbox';

import multiSelectMeta, {
  OverflowCollapse,
  WithDataAttributes,
} from './MultiSelect.stories';

import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
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
  ...multiSelectMeta,
  title: 'Tests/MultiSelect',
};

export default meta;
type Story = StoryObj<typeof multiSelectMeta>;

export const OverflowCollapseGeometry: Story = {
  ...OverflowCollapse,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

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

export const WithDataAttributesStyle: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Frameworks' });

    await expect(trigger).toHaveClass('nx:bg-container');
    await expect(trigger).toHaveClass('nx:enabled:hover:bg-container-hover');
  },
};

export const WithDataAttributesMotion: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await userEvent.click(canvas.getByRole('button', { name: 'Frameworks' }));
    const listbox = await body.findByRole('listbox');
    const options = Array.from(
      listbox.querySelectorAll('[data-slot="multi-select-item"]')
    );
    await expectImmediateItemMotion(options);
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
