import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import type { Collapsible } from './collapsible';
import collapsibleMeta, { WithDataAttributes } from './Collapsible.stories';

const meta: Meta<typeof Collapsible> = {
  ...collapsibleMeta,
  title: 'Tests/Collapsible',
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const WithDataAttributesMotion: Story = {
  ...WithDataAttributes,
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-slot="collapsible-content"]')
    ).toHaveClass('nx:duration-default');
  },
};
