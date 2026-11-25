import type { StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';

import collapsibleMeta, { WithDataAttributes } from './Collapsible.stories';

const meta = {
  ...collapsibleMeta,
  title: 'Tests/Collapsible',
};

export default meta;
type Story = StoryObj<typeof collapsibleMeta>;

export const WithDataAttributesMotion: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-content"]')
    ).toHaveClass('nx:duration-default');
  },
};
