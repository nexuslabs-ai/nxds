import { DENSITY_OPTIONS } from '@nxds/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from 'storybook/test';

import { expectTextFits } from '../../stories/support/story-height-test-utils';

import { Kbd } from './kbd';
import kbdMeta from './Kbd.stories';

const meta: Meta<typeof Kbd> = {
  ...kbdMeta,
  title: 'Tests/Kbd',
};

export default meta;
type Story = StoryObj<typeof Kbd>;

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const TextFitsAtEveryDensity: Story = {
  // Text is tallest at the Larger UI scale, so it fits at every smaller one.
  globals: { uiScale: 'larger' },
  render: () => (
    <div className="nx:flex nx:flex-col nx:items-start nx:gap-3">
      {DENSITIES.map((density) => (
        <div
          key={density}
          data-density={density}
          data-testid={`row-${density}`}
        >
          <Kbd>Ctrl</Kbd>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const density of DENSITIES) {
      const element = within(canvas.getByTestId(`row-${density}`)).getByText(
        'Ctrl'
      );
      // The key label fits inside the border at every density.
      await expectTextFits(element);
    }
  },
};
