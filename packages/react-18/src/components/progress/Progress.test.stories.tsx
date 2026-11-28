import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import type { Progress } from './progress';
import progressMeta, {
  Indeterminate,
  WithDataAttributes,
} from './Progress.stories';

const meta: Meta<typeof Progress> = {
  ...progressMeta,
  title: 'Tests/Progress',
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const IndeterminateMotion: Story = {
  ...Indeterminate,
  play: async ({ canvasElement }) => {
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );

    await expect(getComputedStyle(indicator as Element).animationName).toBe(
      'nx-progress-indeterminate'
    );
    await expect(getComputedStyle(indicator as Element).animationDuration).toBe(
      '1.5s'
    );
  },
};

export const WithDataAttributesMotion: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    const indicator = canvasElement.querySelector(
      '[data-slot="progress-indicator"]'
    );

    await expect(indicator).toHaveClass('nx:duration-fast');
  },
};
