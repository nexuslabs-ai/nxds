import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { Alert } from './alert';
import alertMeta, { DisabledClose } from './Alert.stories';

const meta: Meta<typeof Alert> = {
  ...alertMeta,
  title: 'Tests/Alert',
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const DisabledCloseStyle: Story = {
  ...DisabledClose,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const close = canvas.getByRole('button', { name: 'Dismiss alert' });

    // Disabled close uses a semantic text token at full opacity (not a fade).
    await expect(close).toHaveClass('nx:disabled:text-disabled-foreground');
    await expect(getComputedStyle(close).opacity).toBe('1');
  },
};
