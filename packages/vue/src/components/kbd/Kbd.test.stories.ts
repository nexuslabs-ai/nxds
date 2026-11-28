import { DENSITY_OPTIONS } from '@nxds/core';
import type { StoryObj } from '@storybook/vue3-vite';
import { within } from 'storybook/test';

import { expectTextFits } from '../../stories/support/story-height-test-utils';

import kbdMeta from './Kbd.stories';

import { Kbd } from '.';

const meta = {
  ...kbdMeta,
  title: 'Tests/Kbd',
};

export default meta;
type Story = StoryObj<typeof kbdMeta>;

const DENSITIES = DENSITY_OPTIONS.map((option) => option.value);

export const TextFitsAtEveryDensity: Story = {
  // Text is tallest at the Larger UI scale, so it fits at every smaller one.
  globals: { uiScale: 'larger' },
  render: () => ({
    components: { Kbd },
    setup: () => ({ densities: DENSITIES }),
    template: `
      <div class="nx:flex nx:flex-col nx:items-start nx:gap-3">
        <div
          v-for="density in densities"
          :key="density"
          :data-density="density"
          :data-testid="'row-' + density"
        >
          <Kbd>Ctrl</Kbd>
        </div>
      </div>
    `,
  }),
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
