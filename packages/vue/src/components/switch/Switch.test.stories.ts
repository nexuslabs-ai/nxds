import { DENSITY_OPTIONS } from '@nxds/core';
import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import { expectInsideBorder } from '../../stories/support/story-height-test-utils';

import switchMeta, {
  Disabled,
  DisabledChecked,
  Invalid,
} from './Switch.stories';

import { Switch } from '.';

const meta = {
  ...switchMeta,
  title: 'Tests/Switch',
};

export default meta;
type Story = StoryObj<typeof switchMeta>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // An unchecked-disabled switch recolors its border via a semantic disabled
    // token at full opacity (not a fade).
    await expect(switchEl).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const DisabledCheckedStyle: Story = {
  ...DisabledChecked,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    // A checked-disabled switch fills via a semantic primary-disabled token at
    // full opacity (not a fade).
    await expect(switchEl).toHaveClass(
      'nx:data-[state=checked]:disabled:bg-primary-disabled'
    );
    await expect(getComputedStyle(switchEl).opacity).toBe('1');
  },
};

export const InvalidStyle: Story = {
  ...Invalid,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');

    await expect(switchEl).toHaveClass('nx:aria-invalid:border-error-border');
    await expect(switchEl).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
    await expect(switchEl).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:border-primary-background'
    );
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);
const STROKES = ['fine', 'normal', 'strong'] as const;

export const SizesAtEveryDensity: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ densities: DENSITIES }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
          class="nx:flex nx:items-center nx:gap-3"
        >
          <Switch :default-value="true" :aria-label="'Default size, ' + density" />
          <Switch size="sm" :default-value="true" :aria-label="'Small size, ' + density" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const size = (element: Element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    };
    const reference = within(canvas.getByTestId('row-default'))
      .getAllByRole('switch')
      .map(size);
    for (const density of DENSITIES) {
      const controls = within(
        canvas.getByTestId(`row-${density}`)
      ).getAllByRole('switch');
      // Each switch keeps its Default size at every density.
      await expect(controls.map(size)).toEqual(reference);
      // The thumb stays inside the track's border at every density.
      for (const control of controls) {
        await expectInsideBorder(
          control.querySelector('[data-slot="switch-thumb"]')!,
          control
        );
      }
    }
  },
};

export const ThumbAtEveryStroke: Story = {
  render: () => ({
    components: { Switch },
    setup: () => ({ strokes: STROKES }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <div
          v-for="stroke in strokes"
          :key="stroke"
          :data-borderwidth="stroke"
          :data-testid="'row-' + stroke"
          class="nx:flex nx:items-center nx:gap-3"
        >
          <Switch :aria-label="'Off, ' + stroke" />
          <Switch :default-value="true" :aria-label="'On, ' + stroke" />
          <Switch size="sm" :aria-label="'Small off, ' + stroke" />
          <Switch size="sm" :default-value="true" :aria-label="'Small on, ' + stroke" />
        </div>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const stroke of STROKES) {
      const controls = within(canvas.getByTestId(`row-${stroke}`)).getAllByRole(
        'switch'
      );
      // The thumb is a circle as tall as the inside of the track, and it
      // stays inside the border, on and off, at every stroke.
      for (const control of controls) {
        const thumb = control.querySelector<HTMLElement>(
          '[data-slot="switch-thumb"]'
        )!;
        await expect(thumb.offsetHeight).toBe(control.clientHeight);
        await expect(thumb.offsetWidth).toBe(thumb.offsetHeight);
        await expectInsideBorder(thumb, control);
      }
    }
  },
};

export const TargetArea: Story = {
  render: () => ({
    components: { Switch },
    template: `<Switch aria-label="Email alerts" />`,
  }),
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('switch');
    const box = control.getBoundingClientRect();
    // A press 1px outside the track still lands on its 24px-high target,
    // at the middle and near the end of the track.
    await expect(
      document.elementFromPoint(box.left + box.width / 2, box.top - 1)
    ).toBe(control);
    await expect(document.elementFromPoint(box.left + 3, box.bottom + 1)).toBe(
      control
    );
  },
};
