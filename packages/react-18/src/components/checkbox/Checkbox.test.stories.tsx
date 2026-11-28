import { DENSITY_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { expectInsideBorder } from '../../stories/support/story-height-test-utils';

import { Checkbox } from './checkbox';
import checkboxMeta, { Disabled, InvalidStates } from './Checkbox.stories';

const meta: Meta<typeof Checkbox> = {
  ...checkboxMeta,
  title: 'Tests/Checkbox',
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');

    await expect(checkbox).toHaveClass('nx:disabled:border-border-disabled');
    await expect(getComputedStyle(checkbox).opacity).toBe('1');
  },
};

export const InvalidStatesStyle: Story = {
  ...InvalidStates,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checked = canvas.getByRole('checkbox', {
      name: 'Checked invalid option',
    });
    const indeterminate = canvas.getByRole('checkbox', {
      name: 'Indeterminate invalid option',
    });

    // The invalid pressed state can't be triggered deterministically in a play
    // fn, so assert the press token resolves to the -active shade (not the rest
    // shade) via the class contract — for both checked and indeterminate, since
    // the source swaps both.
    await expect(checked).toHaveClass(
      'nx:enabled:aria-invalid:data-[state=checked]:active:bg-error-background-active'
    );
    await expect(indeterminate).toHaveClass(
      'nx:enabled:aria-invalid:data-[state=indeterminate]:active:bg-error-background-active'
    );
  },
};

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);
const STROKES = ['fine', 'normal', 'strong'] as const;

export const SizeAtEveryDensity: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      {DENSITIES.map((density) => (
        <div
          key={density}
          data-density={density}
          data-testid={`row-${density}`}
        >
          <Checkbox defaultChecked aria-label={`Checked, ${density}`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const width = (element: Element) => element.getBoundingClientRect().width;
    const reference = width(
      within(canvas.getByTestId('row-default')).getByRole('checkbox')
    );
    for (const density of DENSITIES) {
      const control = within(canvas.getByTestId(`row-${density}`)).getByRole(
        'checkbox'
      );
      // The control keeps its Default size at every density.
      await expect(width(control)).toBe(reference);
      // The mark stays inside the border.
      await expectInsideBorder(
        control.querySelector('[data-slot="checkbox-check"]')!,
        control
      );
    }
  },
};

export const MarkAtEveryStroke: Story = {
  render: () => (
    <div className="nx:flex nx:flex-col nx:gap-3">
      {STROKES.map((stroke) => (
        <div
          key={stroke}
          data-borderwidth={stroke}
          data-testid={`row-${stroke}`}
          className="nx:flex nx:items-center nx:gap-3"
        >
          <Checkbox defaultChecked aria-label={`Checked, ${stroke}`} />
          <Checkbox
            defaultChecked="indeterminate"
            aria-label={`Partly checked, ${stroke}`}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const stroke of STROKES) {
      const controls = within(canvas.getByTestId(`row-${stroke}`)).getAllByRole(
        'checkbox'
      );
      // The check and the minus stay inside the border at every stroke.
      for (const control of controls) {
        await expectInsideBorder(
          control.querySelector('[data-slot="checkbox-check"]')!,
          control
        );
        await expectInsideBorder(
          control.querySelector('[data-slot="checkbox-minus"]')!,
          control
        );
        // Each mark draws the line for the box less its two borders.
        const box = getComputedStyle(control);
        const markSize =
          parseFloat(box.width) -
          2 * parseFloat(box.getPropertyValue('--nx-borderwidth-default'));
        for (const mark of control.querySelectorAll('svg')) {
          const style = getComputedStyle(mark);
          const base = parseFloat(
            style.getPropertyValue('--nx-icon-stroke-base')
          );
          const ratio = parseFloat(
            style.getPropertyValue('--nx-icon-stroke-ratio')
          );
          await expect(parseFloat(style.strokeWidth)).toBeCloseTo(
            base + markSize * ratio
          );
        }
      }
    }
  },
};

export const TargetArea: Story = {
  render: () => <Checkbox aria-label="Accept terms" />,
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('checkbox');
    const box = control.getBoundingClientRect();
    const middle = box.top + box.height / 2;
    // A press 3px outside the 16px box still lands on its 24px target.
    await expect(document.elementFromPoint(box.left - 3, middle)).toBe(control);
    await expect(document.elementFromPoint(box.right + 3, middle)).toBe(
      control
    );
  },
};
