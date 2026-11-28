import { DENSITY_OPTIONS } from '@nxds/core';
import type { StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';

import radioGroupMeta, { Disabled, Invalid } from './RadioGroup.stories';

import { RadioGroup, RadioGroupItem } from '.';

const meta = {
  ...radioGroupMeta,
  title: 'Tests/RadioGroup',
};

export default meta;
type Story = StoryObj<typeof radioGroupMeta>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const one = canvas.getByRole('radio', { name: 'Option one' });

    // Disabled state uses a semantic border token at full opacity (not a fade).
    await expect(one).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(one).opacity).toBe('1');
  },
};

export const InvalidStyle: Story = {
  ...Invalid,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole('radio', { name: 'Credit card' });
    const paypal = canvas.getByRole('radio', { name: 'PayPal' });

    // Unchecked invalid → base error border + error focus ring.
    await expect(paypal).toHaveClass('nx:aria-invalid:border-error-border');
    await expect(paypal).toHaveClass(
      'nx:aria-invalid:focus-visible:outline-focus-error'
    );
    // Checked invalid → combinatorial override outranks the checked primary border.
    await expect(card).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:border-error-border'
    );

    // Checked invalid also reddens the selection dot — the item drives the
    // color and the dot inherits via currentColor (matches checkbox).
    await expect(card).toHaveClass(
      'nx:aria-invalid:data-[state=checked]:text-error-background'
    );
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const SizeAtEveryDensity: Story = {
  render: () => ({
    components: { RadioGroup, RadioGroupItem },
    setup: () => ({ densities: DENSITIES }),
    template: `
      <div class="nx:flex nx:flex-col nx:gap-3">
        <RadioGroup
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
          default-value="on"
          :aria-label="'Choice, ' + density"
        >
          <RadioGroupItem value="on" :aria-label="'On, ' + density" />
        </RadioGroup>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const width = (element: Element) => element.getBoundingClientRect().width;
    const reference = width(
      within(canvas.getByTestId('row-default')).getByRole('radio')
    );
    for (const density of DENSITIES) {
      const control = within(canvas.getByTestId(`row-${density}`)).getByRole(
        'radio'
      );
      // The control keeps its Default size at every density.
      await expect(width(control)).toBe(reference);
      // The mark stays inside the border.
      const mark = control
        .querySelector('[data-slot="radio-group-dot"]')!
        .getBoundingClientRect();
      const box = control.getBoundingClientRect();
      const top = box.top + control.clientTop;
      const left = box.left + control.clientLeft;
      await expect(mark.top).toBeGreaterThanOrEqual(top);
      await expect(mark.bottom).toBeLessThanOrEqual(top + control.clientHeight);
      await expect(mark.left).toBeGreaterThanOrEqual(left);
      await expect(mark.right).toBeLessThanOrEqual(left + control.clientWidth);
    }
  },
};

export const TargetArea: Story = {
  render: () => ({
    components: { RadioGroup, RadioGroupItem },
    template: `
      <RadioGroup aria-label="Plan">
        <RadioGroupItem value="team" aria-label="Team" />
      </RadioGroup>
    `,
  }),
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('radio');
    const box = control.getBoundingClientRect();
    const middle = box.top + box.height / 2;
    // A press 3px outside the 16px circle still lands on its 24px target.
    await expect(document.elementFromPoint(box.left - 3, middle)).toBe(control);
    await expect(document.elementFromPoint(box.right + 3, middle)).toBe(
      control
    );
  },
};
