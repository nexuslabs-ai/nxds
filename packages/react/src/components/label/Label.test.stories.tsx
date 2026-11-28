import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { Label } from './label';
import labelMeta, { Disabled } from './Label.stories';

const meta: Meta<typeof Label> = {
  ...labelMeta,
  title: 'Tests/Label',
};

export default meta;
type Story = StoryObj<typeof Label>;

export const DisabledStyle: Story = {
  ...Disabled,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Accept terms');

    // Peer-disabled label uses a semantic text token at full opacity (not a fade).
    await expect(label).toHaveClass(
      'nx:peer-disabled:text-disabled-foreground'
    );
    await expect(getComputedStyle(label).opacity).toBe('1');
  },
};
